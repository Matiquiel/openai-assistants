"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIHelper = void 0;
const openai_1 = require("openai");
const fs_1 = __importDefault(require("fs"));
class AIHelper {
    constructor(apiKey) {
        this.client = new openai_1.OpenAI({
            apiKey: apiKey
        });
    }
    /**
     * This method returns the id of the assistant found that fits the name provided, if there are more than one occurrece, it will fail.
     */
    GetAssistantId(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.client.beta.assistants.list().then(assistants => {
                    var assistantsFiltered = assistants.data.filter(x => { var _a; return (_a = x.name) === null || _a === void 0 ? void 0 : _a.includes(name); });
                    if (assistantsFiltered.length > 1)
                        reject("There's more than one assistant that fits this name: \n" + assistantsFiltered.map(x => x.name).join("\n"));
                    if (assistantsFiltered.length == 0)
                        reject("that assistant name wasnt found");
                    resolve(assistantsFiltered[0].id);
                }).catch(err => reject(err));
            });
        });
    }
    /**
     * This function creates an assistant and returns its ID
     * The two arrays of files receive a path to the file that you want to read locally.
     * To provide files to files search or code interpreter, just provide their paths
     */
    CreateAssistant(name_1, description_1, instructions_1, withCodeInterpreter_1, withFilesReader_1) {
        return __awaiter(this, arguments, void 0, function* (name, description, instructions, withCodeInterpreter, withFilesReader, codeInterpreterFiles = [], filesReaderFiles = []) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    var codeInterpreterFileIds = [];
                    var filesReaderFileIds = [];
                    if (withCodeInterpreter) {
                        codeInterpreterFiles.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                            const file = yield this.client.files.create({
                                file: fs_1.default.createReadStream(element),
                                purpose: "assistants",
                            });
                            codeInterpreterFileIds.push(file.id);
                        }));
                    }
                    if (withFilesReader) {
                        filesReaderFiles.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                            const file = yield this.client.files.create({
                                file: fs_1.default.createReadStream(element),
                                purpose: "assistants",
                            });
                            filesReaderFileIds.push(file.id);
                        }));
                    }
                    var tools = withCodeInterpreter ? [{ type: "code_interpreter" }] : [];
                    withFilesReader ? tools.push({ type: "file_search" }) : {};
                    var toolResources = withCodeInterpreter ? { code_interpreter: { file_ids: codeInterpreterFileIds } } : {};
                    this.client.beta.assistants.create({
                        model: "gpt-4", // Specify the model you want to use
                        name: name,
                        description: description,
                        instructions: instructions,
                        tools: tools,
                        tool_resources: toolResources
                    }).then(response => {
                        resolve(response.id);
                    }).catch(err => { reject(err); });
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
    /**
 * This function updates an assistant and returns its ID
 * The two arrays of files receive a path to the file that you want to read locally.
 */
    UpdateAssistant(assistantId, name, description, instructions, withCodeInterpreter, withFilesReader, codeInterpreterFiles, filesReaderFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    var codeInterpreterFileIds = [];
                    var filesReaderFileIds = [];
                    if (withCodeInterpreter) {
                        codeInterpreterFiles.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                            const file = yield this.client.files.create({
                                file: fs_1.default.createReadStream(element),
                                purpose: "assistants",
                            });
                            codeInterpreterFileIds.push(file.id);
                        }));
                    }
                    if (withFilesReader) {
                        filesReaderFiles.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                            const file = yield this.client.files.create({
                                file: fs_1.default.createReadStream(element),
                                purpose: "assistants",
                            });
                            filesReaderFileIds.push(file.id);
                        }));
                    }
                    var tools = withCodeInterpreter ? [{ type: "code_interpreter" }] : [];
                    withFilesReader ? tools.push({ type: "file_search" }) : {};
                    var toolResources = withCodeInterpreter ? { code_interpreter: { file_ids: codeInterpreterFileIds } } : {};
                    this.client.beta.assistants.update(assistantId, {
                        model: "gpt-4", // Specify the model you want to use
                        name: name,
                        description: description,
                        instructions: instructions,
                        tools: tools,
                        tool_resources: toolResources
                    }).then(response => {
                        resolve(response.id);
                    }).catch(err => { reject(err); });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    /** This function will create a thread with a message from the user as the first message */
    CreateThread() {
        return __awaiter(this, arguments, void 0, function* (userMessage = undefined) {
            return new Promise((resolve, reject) => {
                var options = userMessage ? { messages: [{ role: 'user', content: userMessage }] } : undefined;
                this.client.beta.threads.create(options)
                    .then(data => resolve(data.id))
                    .catch(err => reject(err));
            });
        });
    }
    /** This method creates a run in a thread. It will read the last messages and generate a response based off them
     * The method will only return a value once the run has reached a final state
    */
    CreateRun(threadId_1, assistantId_1) {
        return __awaiter(this, arguments, void 0, function* (threadId, assistantId, extraInstructions = undefined, additionalMessages = undefined) {
            return new Promise((resolve, reject) => {
                this.client.beta.threads.runs.createAndPoll(threadId, {
                    assistant_id: assistantId,
                    additional_instructions: extraInstructions,
                    additional_messages: additionalMessages,
                }, { pollIntervalMs: 1000 })
                    .then(data => {
                    if (data.status == 'completed')
                        resolve(data.id);
                    else
                        reject(data);
                })
                    .catch(err => reject(err));
            });
        });
    }
    /** This method returns the last message in a thread.
     * The messages are returned as an array. So
    */
    GetLastMessage(threadId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.client.beta.threads.messages.list(threadId, {})
                    .then(response => {
                    var lastMessage = response.data[0].content.filter(x => x.type == 'text')[0];
                    var result = lastMessage.text.value;
                    //    console.log("result:", result)
                    if (lastMessage.text.annotations) {
                        var indexOfAnnotation = lastMessage.text.value.indexOf("【");
                        result = indexOfAnnotation > -1 ? lastMessage.text.value.substring(0, indexOfAnnotation) : result;
                        // console.log("result after cut:", result)
                    }
                    if (result.length == 0)
                        reject("Message is empty by AI, but didnt throw errors");
                    resolve(result);
                })
                    .catch(err => reject(err));
            });
        });
    }
    /** This method adds a message in a thread. Messages are not read by the AI until you create a run */
    AddMessage(threadId, message, role) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.client.beta.threads.messages.create(threadId, { content: message, role: role })
                    .then(data => resolve(data.id))
                    .catch(err => reject(err));
            });
        });
    }
}
exports.AIHelper = AIHelper;
//# sourceMappingURL=ai_helper.js.map