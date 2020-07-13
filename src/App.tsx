import React from "react"
import "./App.css"
import * as FormUp from "./FormUp"
import * as Yup from "yup"

function App() {
	const { fields, form } = FormUp.useFormUp(
		{
			name: FormUp.text(""),
			email: FormUp.email(""),
      dob: FormUp.date(""),
      faveColor: FormUp.select("")
		},
		{
			validationSchema: Yup.object().shape({
				name: Yup.string().test("len", "Must be exactly 5 characters", (val) => val.length === 5),
				dob: Yup.date().required(),
			}),
			onSubmit: (e) => console.log("Submitted"),
		}
	)

	return (
		<div className="App">
			<div>
				<FormUp.Form form={form}>
					<FormUp.Input field={fields.name} />
					<FormUp.Input field={fields.email} />
					<FormUp.Input field={fields.dob} />
          <FormUp.Select field={fields.faveColor}>
            <option disabled value=""></option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
          </FormUp.Select>
					<button type="submit">Submit</button>
				</FormUp.Form>
			</div>
      <button onClick={() => {fields.name.setValue(fields.name.value + "a")}}>Add "a" to name</button>
      <button onClick={() => {fields.name.setTouched(!fields.name.touched)}}>Toggle name touched</button>
			<div>
				<p>
					The name is {fields.name.value}. Email is {fields.email.value}. DoB is {fields.dob.value}. Favourite Color is {fields.faveColor.value}
				</p>
			</div>
			<div>
				<ul></ul>
			</div>
		</div>
	)
}

export default App
