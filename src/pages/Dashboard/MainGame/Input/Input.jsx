import React, { useState } from 'react';
import './Input.scss';
import getSentenceByTags from '../../../../utils/getSentenceByTags';
import {
  // removed deleteUserWord, getAllUserWords
  createUserWord, updateUserWord,
} from '../../../../services/userWords';
import playAudioFunction from '../../../../utils/playAudioFunction';
import { upsertUserStatistics } from '../../../../services/userStatistics';

const Input = (props) => {
  // const [isFirstAnswerTrue, setFirstAnswerTrue] = useState(true);
  // const [placeholderValue, setPlaceholderValue] = useState('');
  const {
    isFirstAnswerRight,
    inputPlaceHolder,
    textExample,
    wordData,
    changeRightAnswerState,
    exampleSentence,
    userWord,
    setIndicator,
    autoPronunciation,
    inputValue,
    setInputClassesAndReadState,
    inputClasses,
    inputReadOnlyFlag,
    clearInputValue,
    currentStatistic,
    bestChainCounter,
    // test
    setInputValue,
    setFirstAnswerRigth,
    setInputPlaceholder,
  } = props;
  const { word, _id, audio } = wordData;

  let leftAndRightPartsOfSentce;
  if (exampleSentence) {
    leftAndRightPartsOfSentce = getSentenceByTags(textExample);
  } else {
    leftAndRightPartsOfSentce = { leftpart: '', rightPart: '' };
  }
  const { leftpart, rightPart } = leftAndRightPartsOfSentce;

  let indicatorValue;
  // if (userWord) {
  //   indicatorValue = userWord.optional.indicator + 1;
  // }

  const postUserWordData = (answerIndicatorValue) => {
    const trainedValue = userWord?.optional?.trained + 1 || 1;
    const difficultValue = userWord?.optional?.difficult || false;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const body = {
      difficulty: 'default',
      optional: {
        deleted: false,
        difficult: difficultValue,
        indicator: answerIndicatorValue,
        lastTrained: today,
        nextTraining: tomorrow,
        trained: trainedValue,
      },
    };
    if (!userWord) {
      setIndicator(answerIndicatorValue);
      createUserWord(_id, body);
    } else {
      setIndicator(answerIndicatorValue);
      updateUserWord(_id, body);
    }
  };

  const checkInputWord = (input) => {
    if (autoPronunciation) {
      playAudioFunction(`https://raw.githubusercontent.com/Koptohhka/rslang-data/master/${audio}`);
    }

    if (input.toLowerCase() === word.toLowerCase()) {
      console.log(isFirstAnswerRight);
      if ((isFirstAnswerRight === true) && !userWord) {
        console.log('first');
        indicatorValue = 5;
      } else if ((isFirstAnswerRight === true) && userWord) {
        console.log('second');
        indicatorValue = userWord.optional.indicator + 1;
      } else if (userWord) {
        console.log('third');
        indicatorValue = userWord.optional.indicator;
      } else {
        console.log('fourth');
        indicatorValue = 2;
      }
      bestChainCounter.count += 1;
      if (currentStatistic.optional.today.longestChain < bestChainCounter.count) {
        currentStatistic.optional.today.longestChain = bestChainCounter.count;
      }
      currentStatistic.optional.today.rightAnswers += 1;
      setInputClassesAndReadState('Input Input--right', true);
      changeRightAnswerState(true);
      postUserWordData(indicatorValue);

      if (!userWord) {
        currentStatistic.optional.today.newWords += 1;
        currentStatistic.optional.today.newWordsLeft -= 1;
      }
      currentStatistic.optional.today.maxWordsPerDayLeft -= 1;
      currentStatistic.optional.today.cards += 1;
      currentStatistic.optional.today.finishWordsLeft -= 1;
      upsertUserStatistics(currentStatistic);
      console.log(currentStatistic);
    } else {
      setFirstAnswerRigth(false);
      setInputPlaceholder(word);
      setInputValue('');
      bestChainCounter.count = 0;
      indicatorValue = userWord?.optional?.indicator || 2;
    }
  };

  return (
    <span>
      {leftpart}
      <input
        placeholder={inputPlaceHolder}
        value={inputValue}
        readOnly={inputReadOnlyFlag}
        className={inputClasses}
        type="text"
        onKeyPress={(evt) => {
          if (evt.key === 'Enter') {
            checkInputWord(evt.target.value);
          }
        }}
        onChange={(evt) => {
          clearInputValue(evt.target.value);
        }}
        maxLength={word.length}
        size={word.length}
      />
      {rightPart}
    </span>
  );
};

export default Input;
