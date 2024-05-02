# Usage

    import { AIHelper } from 'openai-assistants'

    var client = new AIHelper('YOUR API KEY');

    //Creation of assistant with no extra tools
    client.CreateAssistant('My assistant name', 'my assitant description', 'reply every question in french', false, false)
    .then(myAssistantId => { console.log('my newly created assistant is:', myAssistantId) })
    .catch(err => console.error(err));

    //Creation of assistant with code interpreter and local files
    client.CreateAssistant('My assistant name', 'my assitant description', 'reply every question in french', true, false, ["./my_local_path_file1.txt", "./my_local_path_file2.txt"])
    .then(myAssistantId => { console.log('my newly created assistant id is:', myAssistantId) })
    .catch(err => console.error(err));

    //create thread
    client.CreateThread('someMessage')
    .then(myThreadId => { console.log('my newly created thread id is:', myThreadId) })
    .catch(err => console.error(err));

    //run prompt on thread
    client.CreateRun("some thread ID", "some assistnat ID", "refer to user as John", [{ role: 'user', content: 'some optional extra message to send before the run' }])
    .then(myThreadId => { console.log('my newly created thread id is:', myThreadId) })
    .catch(err => console.error(err));

    client.GetAssistantId("some partial or full name of assistant")
    .then(myAssistantId => { console.log('my assistant id is:', myAssistantId) })
    .catch(err => console.error(err));
