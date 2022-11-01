const { containerBootstrap, Nlp, LangEn } = window.nlpjs
​
// shortland function
const el = document.getElementById.bind(document)
​
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
​
// initialize speech recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = SpeechRecognition ? new SpeechRecognition() : null
​
// how long to listen before sending the message
const MESSAGE_DELAY = 3000
​
// timer variable
let timer = null
​
let recognizing = false
​
// delay initialization until form is created
setTimeout(async () => {
  const container = await containerBootstrap()
  container.use(Nlp)
  container.use(LangEn)
  const nlp = container.get("nlp")
  nlp.settings.autoSave = false
  nlp.addLanguage("en")
​
    // Adds the utterances and intents for the NLP
  nlp.addDocument("en", "Hi", "greetings.greet")
  nlp.addDocument("en", "Hello", "greetings.greet")
  nlp.addDocument("en", "Hey!", "greetings.greet")
  nlp.addDocument("en", "Good Day", "greetings.greet")
  nlp.addDocument("en", "Good Morning", "greetings.greet")
  nlp.addDocument("en", "I want to get a new connection.", "greetings.apply_new_connection")
  nlp.addDocument("en", "How to get a new connection?", "greetings.apply_new_connection")
  nlp.addDocument("en", "Can you tell me the process for a new connection?", "greetings.apply_new_connection")
  nlp.addDocument("en", "What are the documents required?", "greetings.documents_req")
  nlp.addDocument("en", "Can you tell me the documents required?", "greetings.documents_req")
  nlp.addDocument("en", "What are the document requirements for a new connection?", "greetings.documents_req")
  nlp.addDocument("en", "What are the charges for a new connection?", "greetings.charges")
  nlp.addDocument("en", "What is the fees?", "greetings.charges")
  nlp.addDocument("en", "How much money is required to get a new connection?", "greetings.charges")
  nlp.addDocument("en", "How can I extend temporary connection duration?", "greetings.extend_connection")
  nlp.addDocument("en", "My connection is over.", "greetings.extend_connection")
  nlp.addDocument("en", "My connection is expired.", "greetings.extend_connection")
  nlp.addDocument("en", "I want to extend the connection.", "greetings.extend_connection")
  nlp.addDocument("en", "Thanks for the help.", "greetings.bye")
  nlp.addDocument("en", "Bye.", "greetings.bye")
  nlp.addDocument("en", "Got it. Thanks.", "greetings.bye")
  nlp.addDocument("en", "Thanks.", "greetings.bye")
  nlp.addDocument("en", "No more help required.", "greetings.bye")
  nlp.addDocument("en", "I want to order food", "greetings.out_of_scope")
  nlp.addDocument("en", "What is 2 + 2?", "greetings.out_of_scope")
  nlp.addDocument("en", "Who's the US President?", "greetings.out_of_scope")
  nlp.addDocument("en", "I want water connection", "greetings.out_of_scope")
  
  // Train also the NLG
  nlp.addAnswer("en", "greetings.greet", "Hello! I am Shubham from Electricity Board Customer Service, Rajasthan. I am here to assist you regarding queries with temporary electricity connection. How can I help you?")
  nlp.addAnswer("en", "greetings.apply_new_connection", "To register a new connection request, you may use following options. You can type “TPDDL NEW” and send to 56161 OR Visit nearest District Consumer Care Centre.")
  nlp.addAnswer("en", "greetings.documents_req", "The documents required for a new temporary electricity connection are: A request form, Identity Proof of registered consumer and copy of last paid bill. In addition to the above documents, Guarantor's Bill is also required.")
  nlp.addAnswer("en", "greetings.charges", "For a new temporary electricity connection, you have to submit a one-time fees of Rs 2000. In addition, you have to submit a deposit of Rs 10000, which will be refunded to you at the expiry of temporary connection period.")
  nlp.addAnswer("en", "greetings.extend_connection", "Short Term Temporary connection can not be extended. Incase you want a new temporary connection, you can either type “TPDDL NEW” and send to 56161 OR Visit nearest District Consumer Care Centre.")
  nlp.addAnswer("en", "greetings.bye", "Thank you for contacting us. Have a great day ahead!")
  nlp.addAnswer("en", "greetings.out_of_scope", "I am sorry I wont be able to assist you on this. You can call 181 to connect with the right agent.")
​
  await nlp.train()
​
  // initialize speech generation
  let synthVoice = null
  if ("speechSynthesis" in window && recognition) {
    // wait until voices are ready
    window.speechSynthesis.onvoiceschanged = () => {
      synthVoice = text => {
        clearTimeout(timer)
        const synth = window.speechSynthesis
        const utterance = new SpeechSynthesisUtterance()
        // select some english voice
        const voice = synth.getVoices().find(voice => {
          return voice.localService && voice.lang === "en-US"
        })
        if (voice) utterance.voice = voice
        utterance.text = text
        synth.speak(utterance)
        timer = setTimeout(onMessage, MESSAGE_DELAY)
      }
    }
  }
​
  // form submit event
  async function onMessage(event) {
    if (event) event.preventDefault()
    const msg = el("message").value
    el("message").value = ""
    if (!msg) return
    const userElement = document.createElement("div")
    userElement.innerHTML = "<b>User</b>: " + msg
    userElement.style.color = "blue"
    el("history").appendChild(userElement)
    const response = await nlp.process("en", msg)
    const answer = response.answer || "I don't understand."
    const botElement = document.createElement("div")
    botElement.innerHTML = "<b>Bot</b>: " + answer
    botElement.style.color = "green"
    el("history").appendChild(botElement)
    if (synthVoice && recognizing) synthVoice(answer)
  }
​
  // Add form submit event listener
  document.forms[0].onsubmit = onMessage
​
  // if speech recognition is supported then add elements for it
  if (recognition) {
    // add speak button
    const speakElement = document.createElement("button")
    speakElement.id = "speak"
    speakElement.innerText = "Speak!"
    speakElement.onclick = e => {
      e.preventDefault()
      recognition.start()
    }
    document.forms[0].appendChild(speakElement)
​
    // add "interim" element
    const interimElement = document.createElement("div")
    interimElement.id = "interim"
    interimElement.style.color = "grey"
    document.body.appendChild(interimElement)
​
    // configure continuous speech recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
​
    // switch to listening mode
    recognition.onstart = function () {
      recognizing = true
      el("speak").style.display = "none"
      el("send").style.display = "none"
      el("message").disabled = true
      el("message").placeholder = "Listening..."
    }
​
    recognition.onerror = function (event) {
      alert(event.error)
    }
​
    // switch back to type mode
    recognition.onend = function () {
      el("speak").style.display = "inline-block"
      el("send").style.display = "inline-block"
      el("message").disabled = false
      el("message").placeholder = "Type your message"
      el("interim").innerText = ""
      clearTimeout(timer)
      onMessage()
      recognizing = false
    }
​
    // speech recognition result event;
    // append recognized text to the form input and display interim results
    recognition.onresult = event => {
      clearTimeout(timer)
      timer = setTimeout(onMessage, MESSAGE_DELAY)
      let transcript = ""
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          let msg = event.results[i][0].transcript
          if (!el("message").value) msg = capitalize(msg.trimLeft())
          el("message").value += msg
        } else {
          transcript += event.results[i][0].transcript
        }
      }
      el("interim").innerText = transcript
    }
  }
})