import React, { useState } from 'react';
import './SignIn.css';
import { withRouter } from 'react-router-dom';
import SuccSignIn from './SuccSignIn/SuccSignIn';
import ErrSignIn from './ErrSignIn/ErrSignIn';
import toPostUserData from '../../../../services/toPostUserData';
import toValidateUserData from '../../../../utils/toValidateUserData';

const SignIn = (props) => {
  console.log(props);
  const mailInputRef = React.createRef();
  const passwordInputRef = React.createRef();

  const [succesSignIn, setSuccesSignIn] = useState(false);
  const [errorSignIn, setErrorSignIn] = useState(false);

  let component;
  if (succesSignIn) {
    component = (
      <SuccSignIn
        changeAuthenticatedState={props.changeAuthenticatedState}
        setSuccesSignIn={setSuccesSignIn}
      />
    );
  } else if (errorSignIn) {
    component = (<ErrSignIn setErrorSignIn={setErrorSignIn} />);
  } else {
    component = (
      <div className="SignIn__container">
        <h1>Войти в систему</h1>
        <input ref={mailInputRef} className="SignIn__input" type="email" placeholder="email" />
        <input ref={passwordInputRef} className="SignIn__input" type="text" placeholder="Пароль" />
        <button
          type="button"
          onClick={() => {
            const userData = {
              email: mailInputRef.current.value,
              password: passwordInputRef.current.value,
            };
            const validateResult = toValidateUserData(userData);
            if (validateResult) {
              toPostUserData(userData, 'signin').then((res) => {
                if (res) {
                  console.log('Успешно');
                  setSuccesSignIn(true);
                } else {
                  console.log('не Успешно');
                  setErrorSignIn(true);
                }
              });
            }
          }}
          className="SignIn__button"
        >
          Войти

        </button>
        <p>
          или
          <button
            type="button"
            onClick={() => {
              props.toChangeSignInState();
            }}
          >
            зарегистрироваться

          </button>
        </p>
      </div>
    );
  }

  return (component);
};

export default withRouter(SignIn);
