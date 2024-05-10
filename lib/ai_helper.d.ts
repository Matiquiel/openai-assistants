import { RunCreateParams } from 'openai/resources/beta/threads/runs/runs';
export declare class AIHelper {
    private client;
    constructor(apiKey: string);
    /**
     * This method returns the id of the assistant found that fits the name provided, if there are more than one occurrece, it will fail.
     */
    GetAssistantId(name: string): Promise<string>;
    /**
     * This function creates an assistant and returns its ID
     * The two arrays of files receive a path to the file that you want to read locally.
     * To provide files to files search or code interpreter, just provide their paths
     */
    CreateAssistant(name: string, description: string, instructions: string, withCodeInterpreter: boolean, withFilesReader: boolean, codeInterpreterFiles?: string[], filesReaderFiles?: string[]): Promise<string>;
    /**
 * This function updates an assistant and returns its ID
 * The two arrays of files receive a path to the file that you want to read locally.
 */
    UpdateAssistant(assistantId: string, name: string, description: string, instructions: string, withCodeInterpreter: boolean, withFilesReader: boolean, codeInterpreterFiles: string[], filesReaderFiles: string[]): Promise<string>;
    /** This function will create a thread with a message from the user as the first message */
    CreateThread(userMessage?: string | undefined): Promise<string>;
    /** This method creates a run in a thread. It will read the last messages and generate a response based off them
     * The method will only return a value once the run has reached a final state
    */
    CreateRun(threadId: string, assistantId: string, extraInstructions?: string | undefined, additionalMessages?: RunCreateParams.AdditionalMessage[] | null | undefined, withFileSearch?: boolean, withCodeInterpreter?: boolean): Promise<string>;
    /** This method returns the last message in a thread.
     * The messages are returned as an array. So
    */
    GetLastMessage(threadId: string): Promise<string>;
    /** This method adds a message in a thread. Messages are not read by the AI until you create a run */
    AddMessage(threadId: string, message: string, role: "user" | "assistant"): Promise<string>;
}
//# sourceMappingURL=ai_helper.d.ts.map