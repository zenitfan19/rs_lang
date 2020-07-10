import React from 'react';
import { NavLink } from 'react-router-dom';
import ProgressBar from '../../../components/Progressbar/ProgressBar';
import enCard from './images/en-card.svg';
import './TodayGoal.scss';

const TodayGoal = (props) => {
  const { todayStatisticsData, cardsPerDay } = props;
  const { cards, newWords, rightAnswers, longestChain } = todayStatisticsData;
  return (
    <div className="TodayGoal Dashboard__card">
      <div className="TodayGoal__title-bar">
        <p className="TodayGoal__title">
          Цель на сегодня
        </p>
        <select className="TodayGoal__select">
          <option>Все слова</option>
          <option>чето еще</option>
          <option>чето еще</option>
        </select>
      </div>
      <div className="TodayGoal__flex-wrapper">
        <p className="TodayGoal__description">
          {`Завершить ${cardsPerDay} карточек. Сегодня вы выполнили ${cards} карточек.
          Для достижения цели выучите ещё ${cardsPerDay - cards} карточек.`}
        </p>
        <img className="TodayGoal__image" src={enCard} alt="английский язык" />
      </div>
      <div className="TodayGoal__progreess-container">
        <ProgressBar progressPercent={33} width="235px" />
        <button type="button" className="TodayGoal__button">
          <NavLink className="TodayGoal__nav-link" to="/main-game">Продолжить</NavLink>
        </button>
      </div>
    </div>
  );
};

export default TodayGoal;
