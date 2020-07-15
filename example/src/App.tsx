import React from "react"

import * as FormUp from "formup"
import "formup/dist/index.css"
import * as Yup from "yup"
import "bootstrap/dist/css/bootstrap.css"
import { Container, Row, Col, Form } from "react-bootstrap"

function FormRow({ field, label, children }: { field: FormUp.Field; label: string, children: React.ReactChild}) {
	return (
		<Form.Group as={Row}>
			<Form.Label column md={3} htmlFor={field.name}>
				{label}
			</Form.Label>
			<Col md={9}>
				{children}
			</Col>
		</Form.Group>
	)
}

function App() {
	const { fields, form, errors } = FormUp.useFormUp(
		{
			name: FormUp.text(""),
			email: FormUp.email(""),
			dob: FormUp.date(""),
			faveColor: FormUp.select(""),
		},
		{
			validationSchema: Yup.object().shape({
				name: Yup.string().test("len", "Name must be exactly 5 characters", (val) => val.length === 5),
				dob: Yup.date().required(),
			}),
			onSubmit: () => console.log("Submitted"),
		}
	)

	return (
		<div className="App">
			<Container>
				<Row>
					<Col>
						<h1>FormUp Example</h1>
					</Col>
				</Row>
				<Row>
					<Col>
						<FormUp.Form form={form} className="form">
							<FormRow label="Name" field={fields.name}>
                <FormUp.Input field={fields.name} />
              </FormRow>
							<FormRow label="Email address" field={fields.email}>
                <FormUp.Input field={fields.email} />
              </FormRow>
              <FormRow label="Date of Birth" field={fields.dob}>
                <FormUp.Input field={fields.dob} />
              </FormRow>
							<FormRow label="Favorite Color" field={fields.faveColor}>
                <FormUp.Select field={fields.faveColor}>
                  <option disabled value=""></option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                </FormUp.Select>
              </FormRow>
							<button type="submit">Submit</button>
						</FormUp.Form>
					</Col>
				</Row>
				<div></div>
				<button
					onClick={() => {
						fields.name.setValue(fields.name.value + "a")
					}}
				>
					Add "a" to name
				</button>
				<button
					onClick={() => {
						fields.name.setTouched(!fields.name.touched)
					}}
				>
					Toggle name touched
				</button>
				<div>
					<p>
						The name is {fields.name.value}. Email is {fields.email.value}. DoB is{" "}
						{fields.dob.value}. Favourite Color is {fields.faveColor.value}
					</p>
				</div>
				<div>
					<ul>
            {errors.map((error: string, index: number) => <li key={index}>{error}</li>)}
          </ul>
				</div>
			</Container>
		</div>
	)
}

export default App
