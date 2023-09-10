import { useCallback, useReducer } from 'react';

const formReducer = (state, action) => {
  switch (action.type) {
    case 'INPUT_CHANGE':
      let formIsValid = true; // uve je true prilikom dispatchovanja
      // console.log('Prilikom svakog dispatcovanja varijabla formIsValid je true ===',formIsValid)
      for (const inputId in state.inputs) {

        if (!state.inputs[inputId]) { // ovaj if blok je povezan sa Auth.js tj. sa funkcijom SwitchModeHandler funkcijom
          continue;
        }
        if (inputId === action.inputId) {
          formIsValid = formIsValid && action.isValid;
        } else {
          formIsValid = formIsValid && state.inputs[inputId].isValid;
        }
      }
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.inputId]: { value: action.value, isValid: action.isValid }
        },
        isValid: formIsValid
      };
    case 'SET_DATA':
      return {
        inputs: action.inputs,
        isValid: action.formIsValid
      };
    default:
      return state;
  }
};

export const useForm = (initialInputs, initialFormValidity) => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    isValid: initialFormValidity
  });

  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({
      type: 'INPUT_CHANGE',
      value: value,
      isValid: isValid,
      inputId: id
    });
  }, []);



  const setFormData = useCallback((inputData, formValidity) => {
    dispatch({
      type: 'SET_DATA',
      inputs: inputData,
      formIsValid: formValidity
    });
  }, []);

  return [formState, inputHandler, setFormData];
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////                                                                               ////////////////
////////////////          ovde se na drugaciji  nacin vrsi updatovanje za       /////////////////
////////////////                formState tj. state.inputs u formReduceru                      ////////////////
////////////////                                                                               ////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////





// import { useCallback, useReducer } from 'react';

// const formReducer = (state, action) => {
//   switch (action.type) {
//     case 'INPUT_CHANGE':
//       let formIsValid = true; // uvek true prilikom dispatcha
//       for (const inputId in state.inputs) {

//         if (!state.inputs[inputId]) { // ovaj if blok je povezan sa Auth.js tj. sa funkcijom SwitchModeHandler funkcijom
//           continue;
//         }
//         if (inputId === action.inputId) {
//           formIsValid = formIsValid && action.isValid;
//         } else {
//           formIsValid = formIsValid && state.inputs[inputId].isValid;
//         }
//       }

//       //ovo je za updatovanje state.inputs
//       let novoStanje = { ...state.inputs }
//       for (const inputId in state.inputs) {
//         if (inputId === action.inputId) {
//           novoStanje[inputId] = { value: action.value, isValid: action.isValid }
//         }
//       }

//       return {
//         ...state,
//         inputs: novoStanje,
//         isValid: formIsValid
//       };


//     case 'SET_DATA':
//       return {
//         inputs: action.inputs,
//         isValid: action.formIsValid
//       };

//     default:
//       return state;
//   }
// };

// export const useForm = (initialInputs, initialFormValidity) => {
//   const [formState, dispatch] = useReducer(formReducer, {
//     inputs: initialInputs,
//     isValid: initialFormValidity
//   });

//   const inputHandler = useCallback((id, value, isValid) => {
//     dispatch({
//       type: 'INPUT_CHANGE',
//       value: value,
//       isValid: isValid,
//       inputId: id
//     });
//   }, []);

//   const setFormData = useCallback((inputData, formValidity) => {
//     dispatch({
//       type: 'SET_DATA',
//       inputs: inputData,
//       formIsValid: formValidity
//     });
//   }, []);

//   return [formState, inputHandler, setFormData];
// };







