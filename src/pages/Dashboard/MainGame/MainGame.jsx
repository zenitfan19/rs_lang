/* eslint-disable no-console */
import React, { PureComponent } from 'react';
import './MainGame.scss';
// import pointIcon from './images/point.svg';
// import deleteIcon from './images/delete.svg';
// import speakerIcon from './images/speaker.svg';
import AssessmentButtons from './AssessmentButtons/AssessmentButtons';
import AnswerButton from './AnswerButton/AnswerButton';
import DifficultyButton from './DifficultyButton/DifficultyButton';
import DeleteButton from './DeleteButton/DeleteButton';
import SpeakerButton from './SpeakerButton/SpeakerButton';
import ArrowButton from './ArrowButton/ArrowButton';
import Popup from './Popup/Popup';
import Input from './Input/Input';
import Indicator from '../../../components/Indicator/Indicator';
import Progressbar from '../../../components/Progressbar/ProgressBar';
import getUserAggregatedWords from '../../../services/userAggregatedWords';
import shuffleArray from '../../../utils/suffleArray';
import { getUserSettings } from '../../../services/settingsService';
// import playAudioFunction from '../../../utils/playAudioFunction';
import {
  createUserWord, updateUserWord, getAllUserWords,
} from '../../../services/userWords';
import { getUserStatistics, upsertUserStatistics } from '../../../services/userStatistics';

const filterMainGame = {
  $and: [
    {
      $and: [
        {
          $or: [
            {
              $and: [
                { 'userWord.optional.nextTraining': new Date().toLocaleDateString() },
              ],
            },
            {
              $and: [
                { 'userWord.optional.indicator': 2 },
                { 'userWord.optional.deleted': false },
              ],
            },
            {
              $and: [
                { 'userWord.optional.indicator': 3 },
                { 'userWord.optional.deleted': false },
              ],
            },
            {
              $and: [
                { 'userWord.optional.indicator': 4 },
                { 'userWord.optional.deleted': false },
              ],
            },
            { userWord: null },
          ],
        },
      ],
    },
    {
      $and: [
        {
          'userWord.optional.lastTrained': { $ne: new Date().toLocaleDateString() },
        },
      ],
    },
  ],
};

class MainGame extends PureComponent {
  currentStatistic = null;

  bestChainCounter = { count: 0 };

  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
      settingsData: null,
      showRightAnswer: false,
      isDataEnabled: false,
      wordsData: [],
      currentWordIndex: 0,
      indicator: 1,
      inputClasses: 'Input',
      inputReadOnlyFlag: false,
      difficultyBtnActive: false,
      inputValue: '',
      inputPlaceHolder: '',
      isFirstAnswerRight: true,
    };
  }

  setFirstAnswerRigth = (value) => {
    this.setState({
      isFirstAnswerRight: value,
    });
  }

  setInputPlaceholder = (value) => {
    this.setState({
      inputPlaceHolder: value,
    });
  }

  changeCardToLeft = () => {
    const { currentWordIndex, wordsData } = this.state;
    const changeWordsData = wordsData.slice();
    changeWordsData.splice(currentWordIndex, 1);
    this.setState({
      wordsData: changeWordsData,
    });
  }

  changePopupShowState = (value) => {
    this.setState({
      showPopup: value,
    });
  }

  clearInputValue = (newValue) => {
    this.setState({
      inputValue: newValue,
    });
  }

  setInputClassesAndReadState = (classes, readonly) => {
    this.setState({
      inputClasses: classes,
      inputReadOnlyFlag: readonly,
    });
  };

  setCurrentIndex = (value) => {
    this.setState({
      currentWordIndex: value,
    });
  }

  setDifficultyButtonState = (value) => {
    this.setState({
      difficultyBtnActive: value,
    });
  }

  setInputValue = (value) => {
    console.log(value);
    this.setState({
      inputValue: value,
    });
  }

  setIndicator = (value = 1) => {
    // if (number) {
    //   nextValue = number;
    let nextValue = value;
    if (typeof value === 'object') {
      nextValue = value.optional.indicator;
    }

    this.setState({
      indicator: nextValue,
    });
  }

  setShowRightAnswer = (value) => {
    this.setState({
      showRightAnswer: value,
    });
  };

  initCardComponent = (wordData) => {
    // console.log(wordData);
    const {
      setCurrentIndex,
      changePopupShowState,
      changeCardToLeft,
      bestChainCounter,
      setInputClassesAndReadState,
      setIndicator,
      setShowRightAnswer,
      setInputValue,
      setDifficultyButtonState,
      currentStatistic,
      setFirstAnswerRigth,
      setInputPlaceholder,

    } = this;
    const {
      settingsData, showRightAnswer, wordsData, currentWordIndex, indicator, inputClasses,
      inputReadOnlyFlag, difficultyBtnActive, inputValue,
      inputPlaceHolder,
      isFirstAnswerRight,
    } = this.state;

    const {
      word,
      textMeaning,
      textMeaningTranslate,
      textExample,
      transcription,
      textExampleTranslate,
      image,
      userWord,
      audio,
    } = wordData;
    const {
      autoPronunciation,
      displayShowAnswerBtn,
      displayAssessmentBtns,
      displayDeleteBtn,
      displayDifficultBtn,
      wordTranslation,
      wordTranscription,
      showWordAndSentenceTranslation,
      associationImage,
      exampleSentence,
      explanationSentence,
    } = settingsData;
    const buttonComponent = [];
    if (displayShowAnswerBtn && !showRightAnswer) {
      buttonComponent.push((
        <AnswerButton
          settingsData={settingsData}
          autoPronunciation={autoPronunciation}
          userWord={userWord}
          audio={audio}
          currentWordIndex={currentWordIndex}
          wordsData={wordsData}
          wordData={wordData}
          setInputClassesAndReadState={setInputClassesAndReadState}
          setIndicator={setIndicator}
          setShowRightAnswer={setShowRightAnswer}
          setInputValue={setInputValue}
          bestChainCounter={bestChainCounter}
          currentStatistic={currentStatistic}
        />
      ));
    } else if (displayAssessmentBtns && showRightAnswer) {
      buttonComponent.push(( // showRightAnswer
        <AssessmentButtons
          key={Math.random()}
          clearInputValue={this.clearInputValue}
          setShowRightAnswer={this.setShowRightAnswer}
          setInputClassesAndReadState={this.setInputClassesAndReadState}
        />
      ));
    }
    return (
      <div className={showRightAnswer ? 'MainGame__card MainGame__card--active' : 'MainGame__card'}>
        <div className="MainGame__indicator-container">
          <Indicator indicator={indicator} />
        </div>
        <div className="MainGame__container">
          <div className="MainGame__flex-wrapper">
            <div className="MainGame__sentence-wrapper">
              <p className="MainGame__card-sentence">
                <Input
                  isFirstAnswerRight={isFirstAnswerRight}
                  inputPlaceHolder={inputPlaceHolder}
                  setInputPlaceholder={setInputPlaceholder}
                  setFirstAnswerRigth={setFirstAnswerRigth}
                  setInputValue={setInputValue}
                  bestChainCounter={this.bestChainCounter}
                  currentStatistic={this.currentStatistic}
                  autoPronunciation={autoPronunciation}
                  clearInputValue={this.clearInputValue}
                  currentWordIndex={currentWordIndex}
                  inputValue={inputValue}
                  inputReadOnlyFlag={inputReadOnlyFlag}
                  inputClasses={inputClasses}
                  setInputClassesAndReadState={this.setInputClassesAndReadState}
                  setIndicator={this.setIndicator}
                  userWord={userWord}
                  exampleSentence={exampleSentence}
                  changeRightAnswerState={this.setShowRightAnswer}
                  wordData={wordData}
                  wordsData={wordsData}
                  textExample={textExample}
                />
              </p>
              {exampleSentence ? <p className="MainGame__card-sentence-translation">{textExampleTranslate}</p>
                : <p className="MainGame__card-sentence-translation">{wordData.wordTranslate}</p>}
            </div>
            <div className="Maingame__control-butttons">
              {displayDifficultBtn ? (
                <DifficultyButton
                  difficultyBtnActive={difficultyBtnActive}
                  userWord={userWord}
                  wordsData={wordsData}
                  currentWordIndex={currentWordIndex}
                  setDifficultyButtonState={setDifficultyButtonState}
                />
              ) : null}
              {displayDeleteBtn ? (
                <DeleteButton
                  wordsData={wordsData}
                  currentWordIndex={currentWordIndex}
                  userWord={userWord}
                  setInputClassesAndReadState={setInputClassesAndReadState}
                  setIndicator={setIndicator}
                  setShowRightAnswer={setShowRightAnswer}
                  setInputValue={setInputValue}
                  changeCardToLeft={changeCardToLeft}
                />
              ) : null}
            </div>
          </div>
          {showRightAnswer
            ? (
              <div className="MainGame__word-info-container">
                {associationImage ? <img src={`https://raw.githubusercontent.com/koptohhka/rslang-data/master/${image}`} alt="" className="MainGame__image" /> : null}
                <div className="MainGame__word-info">
                  <div className="word-info__full-word">
                    <SpeakerButton audio={audio} />
                    <p className="word-info__word word-info__full-word--item">{word}</p>
                    {wordTranscription ? <p className="word-info__transcription">{transcription}</p> : null}
                    {wordTranslation ? <p className="word-info__translation word-info__full-word--item">{wordData.wordTranslate}</p> : null}
                  </div>
                  {explanationSentence ? <p className="word-info__second-sentence-example">{textMeaning}</p> : null}
                  {showWordAndSentenceTranslation ? <p className="word-info__second-sentence-translation">{textMeaningTranslate}</p> : null}
                </div>
              </div>
            ) : null}
          {buttonComponent}
        </div>
        {showRightAnswer ? (
          <ArrowButton
            setInputPlaceholder={setInputPlaceholder}
            setFirstAnswerRigth={setFirstAnswerRigth}
            currentStatistic={currentStatistic}
            changePopupShowState={changePopupShowState}
            currentWordIndex={currentWordIndex}
            wordsData={wordsData}
            setIndicator={setIndicator}
            setInputClassesAndReadState={setInputClassesAndReadState}
            setInputValue={setInputValue}
            setCurrentIndex={setCurrentIndex}
            setShowRightAnswer={setShowRightAnswer}
            setDifficultyButtonState={setDifficultyButtonState}
          />
        ) : null}
      </div>
    );
  };

  componentDidMount = async () => {
    const setingsData = await getUserSettings(localStorage.userToken, localStorage.userId);
    this.setState({
      settingsData: setingsData.optional,
    });

    const statisticsData = await getUserStatistics();
    const { optional } = statisticsData;
    console.log(optional.today);

    if (optional.today.date !== new Date().toLocaleDateString()) {
      const todayStatistic = {
        learnedWords: 0,
        optional: {
          today: {
            date: new Date().toLocaleDateString(),
            cards: 0,
            newWords: 0,
            rightAnswers: 0,
            longestChain: 0,
            finishWordsLeft: setingsData.optional.maxCardsPerDay,
          },
        },
      };
      this.currentStatistic = todayStatistic;
      upsertUserStatistics(todayStatistic);
    } else {
      const userStatistics = await getUserStatistics();
      delete userStatistics.id;
      this.currentStatistic = userStatistics;
    }

    let wordsdataLengthValue = this.currentStatistic.optional.today.finishWordsLeft;
    if (this.currentStatistic.optional.today.isFinished) {
      wordsdataLengthValue = setingsData.optional.maxCardsPerDay;
      console.log(wordsdataLengthValue);
    } else if (this.currentStatistic.optional.today.finishWordsLeft < 1) {
      this.currentStatistic.optional.today.finishWordsLeft = setingsData.optional.maxCardsPerDay;
      wordsdataLengthValue = setingsData.optional.maxCardsPerDay;
    }

    const wordsDataResponse = await getUserAggregatedWords(
      JSON.stringify(filterMainGame), wordsdataLengthValue,
    );
    const todayWordData = shuffleArray(wordsDataResponse[0].paginatedResults);
    console.log(wordsDataResponse);
    this.setIndicator(todayWordData[0].userWord);
    this.setState({
      wordsData: todayWordData,
      isDataEnabled: true,
    });

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    getAllUserWords().then((res) => {
      console.log('Мои слова');
      console.log(res);
    });
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  };

  render() {
    const {
      changePopupShowState, initCardComponent, state,
    } = this;
    const {
      currentWordIndex, wordsData, isDataEnabled, showPopup,
    } = state;
    return (
      <div className="MainGame">
        {
          isDataEnabled ? initCardComponent(wordsData[currentWordIndex]) : ''
        }
        <div className="MainGame__progress-bar">
          <p className="MainGame__progress-index">{currentWordIndex + 1}</p>
          <Progressbar
            progressPercent={(100 / wordsData.length) * (currentWordIndex + 1)}
          />
          <p className="MainGame__progress-length">{wordsData.length}</p>
        </div>
        {showPopup ? <Popup changePopupShowState={changePopupShowState} /> : null}
      </div>
    );
  }
}

export default MainGame;
