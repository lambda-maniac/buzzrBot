const __btn_send__ = () =>
{
    const [btnSend] = $("button#btnsend");
    return btnSend                       ;
};

const __btn_end__ = () =>
{
    const [btnEnd] = $("button#btnend");
    return btnEnd                      ;
};

const __btn_next__ = () =>
{
    const [btnNext] = $("button#btnnext");
    return btnNext                       ;
};

const __ordered_messages__ = () =>
{
    let messages = [];

    $("div#chatarea")
        .children("p")
            .each( (_, element) => 
                { if (element.className != "typing")
                  messages.push({ sender: element.className
                                , text  : element.innerText.replace(/([^\x00-\x7F]|[a-zA-Z0-9_\s])+\:\s*/, "") }) });

    return messages;
};

const __messages__ = () =>
{
    let messages = 
        { sys: []
        , you: []
        , str: [] };

    $("div#chatarea")
        .children("p.sysmsg")
            .each( (_, element) => 
                { messages.sys.push(element.innerText.replace(/([^\x00-\x7F]|[a-zA-Z0-9_\s])+\:\s*/, "")) });

    $("div#chatarea")
        .children("p.yourmsg")
            .each( (_, element) => 
                { messages.you.push(element.innerText.replace(/([^\x00-\x7F]|[a-zA-Z0-9_\s])+\:\s*/, "")) });

    $("div#chatarea")
        .children("p.theirmsg")
            .each( (_, element) => 
                { messages.str.push(element.innerText.replace(/([^\x00-\x7F]|[a-zA-Z0-9_\s])+\:\s*/, "")) });

    return messages;
};

const isChatOver = () =>
{
    let {sys} = __messages__();
    return sys.includes("A conversa foi encerrada.");
};

const sendMessage = (message) =>
{
    const [textArea] = $("textarea#chatinput");

    textArea.value = message;

    __btn_send__().click();
};

const endChat = (message) =>
{
    if (message !== undefined) sendMessage(message);

    __btn_end__().click();
}

const nextChat = (message) =>
{
    if (isChatOver()) __btn_next__().click();
}

const sleep = (ms) => 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

const ask = async (question, answers) =>
{
    if (!isChatOver())
    {
        sendMessage(question);

        let last = null;
        let bias = null;

        while (last == bias)
        {
            [last] = __ordered_messages__().reverse();
             last  = JSON.stringify(last);
             bias  = JSON.stringify({ sender: "yourmsg"
                                    , text  : question });

            if (isChatOver()) return false;
            
            await sleep(1000);

            console.log("Awaiting.");
        }

        [last] = __ordered_messages__().reverse();

        userAnswer = last.text.toLowerCase();

        for (let index = 0; index < answers.length; ++index) {
            const answer = answers[index];

            if (userAnswer == answer) return true;
        }
    }

    return false;
}

const __main__ = async () => 
{
    let points  = 0;
    let mustEnd = false; // needed to propagate the return.

    let invite = { question: "Você quer participar? Sim?"
                 , answers : ["sim.", "sim", "si", "ss", "s", "ok", "k", "manda"] };

    let questions = 
        [ { question: "Quanto é 1 + 1?"       , answers: ["2"]   }
        , { question: "Quanto é 100 / 2?"     , answers: ["50"]  }
        , { question: "Quanto é 2^2?"         , answers: ["4"]   }
        , { question: "Quanto é 1000 / 10?"   , answers: ["100"] }
        , { question: "Quanto é (4 << 1) + 2?", answers: ["10"]  }
        ];

    sendMessage("Olá, meu nome é Ink. Gostaria de fazer uma pequena brincadeira?");
    sendMessage("Eu apenas irei te perguntar algumas coisinhas e você terá que responde-las corretamente, ok?");
    sendMessage(`Lembrando que você começa com ${points} pontos, ganha 1 a cada resposta correta, e perde 1 a cada resposta errada.`);
    sendMessage("Se caso você errar quando estiver com 0 pontos, irá perder...")

    await ask(invite.question, invite.answers).then(alias => {
        if (alias)
            sendMessage(`Ok, vamos lá! Ah, e só de cortesia, você agora tem ${++points} ponto!`);
        else
        {
            endChat("Vou aceitar isso como um 'Não'...");
            mustEnd = true;
        }
    });
    
    if (mustEnd) return;

    for (let index = 0; index < questions.length; index++) {
        const question = questions[index];
        
        await ask(question.question, question.answers).then(alias => {
            if (alias)
            {
                sendMessage(`Exato! Seus pontos agora: ${++points}!`);
            }
            else
            {
                sendMessage(`Errado... Seus pontos agora: ${--points}...`);
            }
        }); 
        
        if (points < 0) { endChat("Você perdeu, que pena..."); return; }
    }

    endChat("Parabéns, você me venceu, mas já já volto com mais perguntas...");
};
// Yes, I didn't have anything to do this morning, so I just played a little bit with JS.
