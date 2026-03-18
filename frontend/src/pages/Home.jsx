import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif"
import { BsMicFill, BsMicMuteFill } from "react-icons/bs";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const isProcessingRef = useRef(false)
  const micOnRef = useRef(false)
  const greetingDoneRef = useRef(false)
  const currentLangRef = useRef('en-US') // ✅ Current language track karo
  const [ham, setHam] = useState(false)
  const synth = window.speechSynthesis

  const setMicOnSynced = (val) => {
    micOnRef.current = val
    setMicOn(val)
  }

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const stopRecognition = () => {
    try {
      if (isRecognizingRef.current) {
        recognitionRef.current?.stop()
      }
    } catch (e) { }
    isRecognizingRef.current = false
    setListening(false)
  }

  const startRecognitionWithLang = (lang) => {
    if (!isSpeakingRef.current && !isRecognizingRef.current && micOnRef.current) {
      try {
        recognitionRef.current.lang = lang
        currentLangRef.current = lang
        recognitionRef.current?.start()
      } catch (e) {
        if (e.name !== "InvalidStateError") console.error(e)
      }
    }
  }

  const startRecognition = () => {
    startRecognitionWithLang(currentLangRef.current)
  }

  const speak = (text, lang = 'en-US') => {
    synth.cancel()
    if (window.responsiveVoice) {
      window.responsiveVoice.cancel()
    }

    isSpeakingRef.current = true

    const onSpeechEnd = () => {
      isSpeakingRef.current = false
      setAiText("")
      setMicOnSynced(false)
      stopRecognition()
    }

    if (window.responsiveVoice) {
      const voice = lang === 'hi-IN' ? "Hindi Female" : "UK English Female"
      window.responsiveVoice.speak(text, voice, {
        onend: onSpeechEnd,
        onerror: onSpeechEnd
      })
    } else {
      const utterance = new SpeechSynthesisUtterance(text)
      const voices = synth.getVoices()
      if (lang === 'hi-IN') {
        const hindiVoice = voices.find(v => v.lang === 'hi-IN')
        if (hindiVoice) utterance.voice = hindiVoice
        utterance.lang = 'hi-IN'
      } else {
        const engVoice = voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en'))
        if (engVoice) utterance.voice = engVoice
        utterance.lang = 'en-US'
      }
      utterance.onend = onSpeechEnd
      utterance.onerror = onSpeechEnd
      synth.speak(utterance)
    }
  }

  const handleCommand = (data, lang) => {
    const { type, userInput, response } = data
    speak(response, lang)

    if (type === 'google-search') {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank')
    }
    if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank')
    }
    if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank')
    }
    if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank')
    }
    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank')
    }
    if (type === 'youtube-search' || type === 'youtube-play') {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank')
    }
    if (type === 'open-url') {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank')
    }
  }

  const handleMicClick = () => {
    if (micOnRef.current) {
      setMicOnSynced(false)
      stopRecognition()
      synth.cancel()
      if (window.responsiveVoice) window.responsiveVoice.cancel()
      isSpeakingRef.current = false
    } else {
      setMicOnSynced(true)
      // ✅ Pehle English mein start karo
      setTimeout(() => startRecognitionWithLang('en-US'), 300)
    }
  }

  // ✅ Assistant name check — Hindi aur English dono mein
  const checkAssistantName = (transcript) => {
    const assistantName = userData.assistantName.toLowerCase()
    const transcriptLower = transcript.toLowerCase()
    
    // English check
    if (transcriptLower.includes(assistantName)) return true
    
    // Hindi transliteration check — common variations
    const hindiVariations = {
      'jarvis': ['जार्विस', 'जारविस', 'जार्विज'],
      'alexa': ['एलेक्सा', 'अलेक्सा'],
      'siri': ['सिरी', 'सीरी'],
      'simran': ['सिमरन', 'सिमरण'],
      'aryan': ['आर्यन', 'अर्यन'],
    }
    
    const variations = hindiVariations[assistantName] || []
    if (variations.some(v => transcript.includes(v))) return true
    
    // Transcript mein assistant name ke pehle 3 chars match karo
    if (transcript.includes(userData.assistantName)) return true
    
    return false
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Tumhara browser Speech Recognition support nahi karta!")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognitionRef.current = recognition

    let isMounted = true
    let langToggle = false // ✅ English/Hindi toggle

    recognition.onstart = () => {
      isRecognizingRef.current = true
      setListening(true)
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      setListening(false)
      if (isMounted && micOnRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
        setTimeout(() => {
          if (isMounted && micOnRef.current) {
            // ✅ Baar baar English/Hindi toggle karo
            langToggle = !langToggle
            const nextLang = langToggle ? 'hi-IN' : 'en-US'
            startRecognitionWithLang(nextLang)
          }
        }, 300)
      }
    }

    recognition.onerror = (event) => {
      console.warn("Mic error:", event.error)
      isRecognizingRef.current = false
      setListening(false)

      if (event.error === 'not-allowed') {
        alert("Mic permission do browser mein!")
        setMicOnSynced(false)
        return
      }

      if (event.error === 'no-speech') {
        // no-speech pe bhi toggle karo
        if (isMounted && micOnRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            if (isMounted && micOnRef.current) {
              langToggle = !langToggle
              const nextLang = langToggle ? 'hi-IN' : 'en-US'
              startRecognitionWithLang(nextLang)
            }
          }, 500)
        }
        return
      }

      if (isMounted && micOnRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted && micOnRef.current) startRecognition()
        }, 1000)
      }
    }

    recognition.onresult = async (e) => {
      const result = e.results[e.results.length - 1]
      if (!result.isFinal) return
      if (isProcessingRef.current) return

      const transcript = result[0].transcript.trim()
      const detectedLang = currentLangRef.current // ✅ Kis language mein tha
      console.log("Transcript:", transcript, "| Lang:", detectedLang)
      setUserText(transcript)

      if (checkAssistantName(transcript)) {
        isProcessingRef.current = true
        stopRecognition()
        setAiText("")

        const data = await getGeminiResponse(transcript)

        if (!data) {
          const errMsg = detectedLang === 'hi-IN'
            ? "माफ करें, कुछ गलत हो गया। कृपया फिर से कोशिश करें।"
            : "Sorry, something went wrong. Please try again."
          speak(errMsg, detectedLang)
          isProcessingRef.current = false
          return
        }

        handleCommand(data, detectedLang) // ✅ Detected language pass karo
        setAiText(data.response)
        setUserText("")
        isProcessingRef.current = false
      } else {
        setTimeout(() => setUserText(""), 2000)
      }
    }

    // ✅ Greeting sirf ek baar
    if (!greetingDoneRef.current) {
      greetingDoneRef.current = true

      setTimeout(() => {
        isSpeakingRef.current = true
        const greetingText = `Hello ${userData.name}, what can I help you with?`

        if (window.responsiveVoice) {
          window.responsiveVoice.speak(greetingText, "UK English Female", {
            onend: () => { isSpeakingRef.current = false },
            onerror: () => { isSpeakingRef.current = false }
          })
        } else {
          const greeting = new SpeechSynthesisUtterance(greetingText)
          greeting.lang = 'en-US'
          greeting.onend = () => { isSpeakingRef.current = false }
          synth.cancel()
          synth.speak(greeting)
        }
      }, 1000)
    }

    return () => {
      isMounted = false
      try { recognition.stop() } catch (e) { }
      isRecognizingRef.current = false
      setListening(false)
    }
  }, [])

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>

      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(true)} />

      {/* Mobile Menu */}
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform z-10`}>
        <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(false)} />
        <button className='min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px]' onClick={handleLogOut}>Log Out</button>
        <button className='min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px] px-[20px] py-[10px]' onClick={() => navigate("/customize")}>Customize your Assistant</button>
        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>
        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
          {userData.history?.map((his, index) => (
            <div key={index} className='text-gray-200 text-[18px] w-full h-[30px]'>{his}</div>
          ))}
        </div>
      </div>

      {/* Desktop Buttons */}
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px] bg-white rounded-full cursor-pointer text-[19px]' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block' onClick={() => navigate("/customize")}>Customize your Assistant</button>

      {/* Assistant Image */}
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
      </div>

      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>

      {/* Mic Button */}
      <div className='flex flex-col items-center gap-[8px]'>
        <button
          onClick={handleMicClick}
          className={`w-[65px] h-[65px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${micOn
            ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)]'
            : 'bg-white shadow-lg'
            }`}
        >
          {micOn
            ? <BsMicFill className='text-white w-[28px] h-[28px]' />
            : <BsMicMuteFill className='text-gray-700 w-[28px] h-[28px]' />
          }
        </button>
        <p className='text-gray-300 text-[13px] font-medium'>
          {micOn && listening
            ? `🎙️ ${currentLangRef.current === 'hi-IN' ? 'सुन रहा हूं...' : 'Listening...'}`
            : micOn ? "🔴 Mic On"
            : "🎤 Click to Speak"
          }
        </p>
      </div>

      {!aiText && !userText && <img src={userImg} alt="" className='w-[150px]' />}
      {aiText && <img src={aiImg} alt="" className='w-[150px]' />}

      <h1 className='text-white text-[18px] font-semibold text-wrap text-center px-[20px]'>
        {userText ? userText : aiText ? aiText : null}
      </h1>

    </div>
  )
}

export default Home