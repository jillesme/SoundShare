/**
 * This will render a form with an input and an accordion. The input will have the default value of "Hello", and the accordion will automatically have 2 items in it, with the first one's input having the default value of "First accordion's input default value". The input will be disabled, and the input in the first accordion will be disabled too. The second accordion's input will be required, but not disabled.
 */
var form = Adapt.form('name', {
  view: {
    inputOne: {
      label: 'Input One!',
      type: 'input',
    },
    accordion: {
      type: 'accordion',
      model: {
        input: {
          label: 'Input inside of an accordion!',
          type: 'input'
        }
      }
    }
  },
  model: {
    inputOne: 'Hello'
    accordion: [
      {
        input: 'First accordion\'s input default value'
      },
      {

      } // this will insert a blank accordion
    ]
  },
  controller: [
    {
      state: ['State1'],
      items: {
        inputOne: {
          disabled: true
        },
        accordion: [
          {
            input: {
              disabled: true
            }
          },
          {
            input: {
              required: true
            }
          }
        ] // by default the values will be the same for each accordion, however it is possible to define a controller on an individual accordion basis
      }
    }
  ]
});