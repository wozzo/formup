# react-formup

> React forms without all the boilerplate

[![NPM](https://img.shields.io/npm/v/formup.svg)](https://www.npmjs.com/package/react-formup) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-formup
```

```bash
yarn add react-formup
```

## Usage

```tsx
import React, { Component } from 'react'

import * as Formup* from 'formup'
import * asYup from "yup"
function Example() {
  const { fields, form, errors } = FormUp.useFormUp(
		{
			name: FormUp.text(""),
			email: FormUp.email(""),
			dob: FormUp.date(""),
			faveColor: FormUp.select(""),
		},
		{
			validationSchema: Yup.object().shape({
				name: Yup.string().test(
					"len",
					"Name must be exactly 5 characters",
					(val) => val.length === 5
				),
				dob: Yup.date().required(),
			}),
			onSubmit: () => console.log("Submitted"),
		}
  )
  
  return (
    <FormUp.Form form={form}>
      <FormUp.Input field={field.name} />
      <FormUp.Input field={field.email} />
      <FormUp.Input field={field.dob} />
      <FormUp.Select field={field.faveColor}>
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
      </FormUp.Select>
    </FormUp.Form>
  )
}
```

## License

MIT © [wozzo](https://github.com/wozzo)
