import { OpenAI } from 'openai';
import { AssistantTool } from 'openai/resources/beta/assistants';
import { RunCreateParams } from 'openai/resources/beta/threads/runs/runs';
import { TextContentBlock } from 'openai/resources/beta/threads/messages';
import { ThreadCreateParams } from 'openai/resources/beta/threads/threads';
import fs from 'fs'
export class AIHelper {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey: apiKey
        });
    }
    /**
     * This method returns the id of the assistant found that fits the name provided, if there are more than one occurrece, it will fail.
     */
    public async GetAssistantId(name: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.client.beta.assistants.list().then(assistants => {
                var assistantsFiltered = assistants.data.filter(x => x.name?.includes(name));
                if (assistantsFiltered.length > 1)
                    reject("There's more than one assistant that fits this name: \n" + assistantsFiltered.map(x => x.name).join("\n"));

                if (assistantsFiltered.length == 0)
                    reject("that assistant name wasnt found")

                resolve(assistantsFiltered[0].id);
            }).catch(err => reject(err));
        });
    }

    /**
     * This function creates an assistant and returns its ID
     * The two arrays of files receive a path to the file that you want to read locally.
     * To provide files to files search or code interpreter, just provide their paths
     */
    public async CreateAssistant(name: string,
        description: string,
        instructions: string,
        withCodeInterpreter: boolean,
        withFilesReader: boolean,
        codeInterpreterFiles: string[] = [],
        filesReaderFiles: string[] = []): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                var codeInterpreterFileIds: string[] = [];
                var filesReaderFileIds: string[] = [];
                if (withCodeInterpreter) {
                    codeInterpreterFiles.forEach(async element => {
                        const file = await this.client.files.create({
                            file: fs.createReadStream(element),
                            purpose: "assistants",
                        });
                        codeInterpreterFileIds.push(file.id);
                    });
                }

                if (withFilesReader) {
                    filesReaderFiles.forEach(async element => {
                        const file = await this.client.files.create({
                            file: fs.createReadStream(element),
                            purpose: "assistants",
                        });

                        filesReaderFileIds.push(file.id);
                    });
                }

                var tools: AssistantTool[] | undefined = withCodeInterpreter ? [{ type: "code_interpreter" }] : [];
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
                    resolve(response.id)
                }).catch(err => { reject(err) });
            } catch (error) {
                reject(error)
            }
        });
    }

    /**
 * This function updates an assistant and returns its ID
 * The two arrays of files receive a path to the file that you want to read locally.
 */
    public async UpdateAssistant(assistantId: string,
        name: string,
        description: string,
        instructions: string,
        withCodeInterpreter: boolean,
        withFilesReader: boolean,
        codeInterpreterFiles: string[],
        filesReaderFiles: string[]): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                var codeInterpreterFileIds: string[] = [];
                var filesReaderFileIds: string[] = [];
                if (withCodeInterpreter) {
                    codeInterpreterFiles.forEach(async element => {
                        const file = await this.client.files.create({
                            file: fs.createReadStream(element),
                            purpose: "assistants",
                        });
                        codeInterpreterFileIds.push(file.id);
                    });
                }

                if (withFilesReader) {
                    filesReaderFiles.forEach(async element => {
                        const file = await this.client.files.create({
                            file: fs.createReadStream(element),
                            purpose: "assistants",
                        });

                        filesReaderFileIds.push(file.id);
                    });
                }

                var tools: AssistantTool[] | undefined = withCodeInterpreter ? [{ type: "code_interpreter" }] : [];
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
                    resolve(response.id)
                }).catch(err => { reject(err) });
            } catch (error) {
                reject(error)
            }
        });
    }

    /** This function will create a thread with a message from the user as the first message */
    public async CreateThread(userMessage: string | undefined = undefined): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            var options: ThreadCreateParams | undefined = userMessage ? { messages: [{ role: 'user', content: userMessage }] } : undefined;
            this.client.beta.threads.create(options)
                .then(data => resolve(data.id))
                .catch(err => reject(err));
        });
    }

    /** This method creates a run in a thread. It will read the last messages and generate a response based off them 
     * The method will only return a value once the run has reached a final state
    */
    public async CreateRun(threadId: string, assistantId: string, extraInstructions: string | undefined = undefined, additionalMessages: RunCreateParams.AdditionalMessage[] | null | undefined = undefined): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.client.beta.threads.runs.createAndPoll(threadId, {
                assistant_id: assistantId,
                additional_instructions: extraInstructions,
                additional_messages: additionalMessages,
            }, { pollIntervalMs: 1000 })
                .then(data => {
                    if (data.status == 'completed') resolve(data.id)
                    else reject(data)
                })
                .catch(err => reject(err));
        })
    }

    /** This method returns the last message in a thread.
     * The messages are returned as an array. So 
    */
    public async GetLastMessage(threadId: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.client.beta.threads.messages.list(threadId, {})
                .then(response => {
                    var lastMessage = (response.data[0].content.filter(x => x.type == 'text') as TextContentBlock[])[0];
                    var result = lastMessage.text.value
                    //    console.log("result:", result)
                    if (lastMessage.text.annotations) {
                        var indexOfAnnotation = lastMessage.text.value.indexOf("【")
                        result = indexOfAnnotation > -1 ? lastMessage.text.value.substring(0, indexOfAnnotation) : result
                        // console.log("result after cut:", result)
                    }
                    if (result.length == 0)
                        reject("Message is empty by AI, but didnt throw errors")

                    resolve(result)
                })
                .catch(err => reject(err));
        })
    }

    /** This method adds a message in a thread. Messages are not read by the AI until you create a run */
    public async AddMessage(threadId: string, message: string, role: "user" | "assistant"): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.client.beta.threads.messages.create(threadId, { content: message, role: role })
                .then(data => resolve(data.id))
                .catch(err => reject(err));
        })
    }
}