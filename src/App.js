import { useState, useEffect, useRef } from 'react';
import * as mobilenet from "@tensorflow-models/mobilenet";

function App() {
    const [isModelLoading, setIsModelLoading] = useState(false)
    const [model, setModel] = useState(null)
    const [imageURL, setImageURL] = useState(null);
    const [results, setResults] = useState([])
    const [history, setHistory] = useState([])

    const imgReference = useRef()
    const textReference = useRef()
    const fileReference = useRef()

    const loadModel = async () => {
        setIsModelLoading(true)
        try {
            const model = await mobilenet.load()
            setModel(model)
            setIsModelLoading(false)
        } catch (error) {
            console.log(error)
            setIsModelLoading(false)
        }
    }

    const uploadImage = (e) => {
        const { files } = e.target
        if (files.length > 0) {
            const url = URL.createObjectURL(files[0])
            setImageURL(url)
        } else {
            setImageURL(null)
        }
    }

    const identify = async () => {
        textReference.current.value = ''
        const results = await model.classify(imgReference.current)
        setResults(results)
    }

    const handleOnChange = (e) => {
        setImageURL(e.target.value)
        setResults([])
    }

    const triggerUpload = () => {
        fileReference.current.click()
    }

    useEffect(() => {
        loadModel()
    }, [])

    useEffect(() => {
        if (imageURL) {
            setHistory([imageURL, ...history])
        }
    }, [imageURL])

    if (isModelLoading) {
        return <h2>Model Loading...</h2>
    }

    return (
        <div className="App">
            <h1 className='header'>Image Identification</h1>
            <div className='holderinput'>
                <input type='file' accept='image/*' capture='camera' className='uploadInput' onChange={uploadImage} ref={fileReference} />
                <button className='uploadImage' onClick={triggerUpload}>Upload Image</button>
                <span className='or'>OR</span>
                <input type="text" placeholder='Paster image URL' ref={textReference} onChange={handleOnChange} />
            </div>
            <div className="wrapper">
                <div className="main">
                    <div className="image">
                        {imageURL && <img src={imageURL} alt="Upload Preview" crossOrigin="anonymous" ref={imgReference} />}
                    </div>
                    {results.length > 0 && <div className='results'>
                        {results.map((result, index) => {
                            return (
                                <div className='result' key={result.className}>
                                    <span className='name'>{result.className}</span>
                                    <span className='confidence'>Confidence level: {(result.probability * 100).toFixed(2)}% {index === 0 && <span className='bestGuess'>Best Guess</span>}</span>
                                </div>
                            )
                        })}
                    </div>}
                </div>
                {imageURL && <button className='btn' onClick={identify}>Identify Image</button>}
            </div>
            {history.length > 0 && <div className="Predictions">
                <h2>Recent Images</h2>
                <div className="recentImages">
                    {history.map((image, index) => {
                        return (
                            <div className="recentPrediction" key={`${image}${index}`}>
                                <img src={image} alt='Recent Prediction' onClick={() => setImageURL(image)} />
                            </div>
                        )
                    })}
                </div>
            </div>}
        </div>
    );
}

export default App;
