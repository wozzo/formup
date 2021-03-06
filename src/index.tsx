import React, { useReducer, useState } from "react"
import * as Yup from "yup"

type FieldDescriptor = {
	type: string
	initial: any
}

export function text(initial: any): FieldDescriptor {
	return {
		type: "text",
		initial: initial,
	}
}

export function email(initial: any): FieldDescriptor {
	return {
		type: "email",
		initial: initial,
	}
}

export function date(initial: any): FieldDescriptor {
	return {
		type: "date",
		initial: initial,
	}
}

export function select(initial: any): FieldDescriptor {
	return {
		type: "select",
		initial: initial,
	}
}

export type FormDescriptor<T> = {
	[K in keyof T]: FieldDescriptor
}

export type Field = {
	name: string
	type: string
	value: any
	error?: string
	touched: boolean
	setValue: (value: any) => void | Promise<void>
	setTouched: (touched: boolean) => void
}

export type Fields<T> = {
	[K in keyof T]: Field
}

export type FieldValues = {
	[fieldName: string]: any
}

export type FieldValueUpdateAction = {
	fieldName: string
	value: any
}

export type FormOptions = {
	validationSchema?: Yup.ObjectSchema<object | undefined>
	onSubmit: (e: React.FormEvent) => void | Promise<any>
}

export type FormSettings = {
	getValidationErrors: () => object
	onSubmit: (e: React.FormEvent) => void | Promise<any>
}
export type FormDetails = {
	validationErrors: Yup.ValidationError | undefined
}

const convertYupValidationError = (ex: Yup.ValidationError) =>
	ex.inner.reduce((all, curr) => {
		all[curr.path] = curr.message
		return all
	}, {} as any)

export type FormDefinition<T> = {
	fields: Fields<T>
	form: FormSettings
	errors: Array<string>
}

export function useFormUp<T>(formDescriptor: FormDescriptor<T>, options: FormOptions): FormDefinition<T> {
	const [validationErrors, setValidationErrors] = useState({} as any)

	const fieldNames = Object.keys(formDescriptor)

	const initialValues = fieldNames.reduce((all, currentFieldName) => {
		const currentFieldDescriptor = (formDescriptor as any)[currentFieldName] as FieldDescriptor
		all[currentFieldName] = currentFieldDescriptor.initial
		return all
	}, {} as FieldValues)

	const fieldValueChangeReducer = (state: FieldValues, action: FieldValueUpdateAction) => {
		return {
			...state,
			[action.fieldName]: action.value,
		}
	}

	const [fieldValues, dispatchFieldValueChange] = useReducer(fieldValueChangeReducer, initialValues)

	const touchedReducer = (state: FieldValues, action: { fieldName: string; touched: boolean }) => {
		return {
			...state,
			[action.fieldName]: action.touched,
		}
	}
	const [touched, dispatchTouchedChange] = useReducer(
		touchedReducer,
		fieldNames.reduce((prev, curr) => {
			prev[curr] = false
			return prev
		}, {} as any)
	)

	const fields = fieldNames.reduce((all, currentFieldName) => {
		const currentFieldDescriptor = (formDescriptor as any)[currentFieldName] as FieldDescriptor

		all[currentFieldName] = {
			name: currentFieldName,
			type: currentFieldDescriptor.type,
			value: fieldValues[currentFieldName],
			error: validationErrors[currentFieldName],
			touched: touched[currentFieldName],
			setValue: (value: any) =>
				dispatchFieldValueChange({
					fieldName: currentFieldName,
					value: value,
				}),
			setTouched: (touched: boolean) =>
				dispatchTouchedChange({
					fieldName: currentFieldName,
					touched: touched,
				}),
		}
		return all
	}, {} as any) as Fields<T>

	const getValidationErrors = async () => {
		if (!options.validationSchema) {
			return {}
		}

		try {
			await options.validationSchema.validate(fieldValues, {
				abortEarly: false,
			})
			return {}
		} catch (ex) {
			const validationErrors = ex as Yup.ValidationError
			const convertedErrors = convertYupValidationError(validationErrors)
			return convertedErrors
		}
	}

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const validationErrors = await getValidationErrors()
		setValidationErrors(validationErrors)
		Object.keys(fields).forEach((key) => fields[key].setTouched(true))

		if (Object.keys(validationErrors).length > 0) {
			return false
		}

		return options.onSubmit(e)
	}

	const form: FormSettings = {
		onSubmit,
		getValidationErrors,
	}

	const errors = Object.keys(validationErrors).reduce((all, curr) => {
		all.push(validationErrors[curr])
		return all
	}, [] as string[])

	return { fields, form, errors: [...errors] }
}

export interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
	field: Field
}

export interface SelectProps extends React.HTMLAttributes<HTMLSelectElement> {
	field: Field
}

export function Select({ field, ...props }: SelectProps) {
	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		field.setValue(e.target.value)
		if (props.onChange) {
			props.onChange(e)
		}
	}

	const onBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
		field.setTouched(true)
		if (props.onBlur) {
			props.onBlur(e)
		}
	}

	const classes = props.className?.split(" ") || []
	if (field.touched) {
		classes.push("formup-touched")
	}
	if (field.error) {
		classes.push("formup-error")
	}

	return (
		<select
			{...props}
			name={field.name}
			value={field.value}
			className={classes.join(" ")}
			onBlur={onBlur}
			onChange={onChange}
		/>
	)
}

export function Input({ field, ...props }: InputProps) {
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		field.setValue(e.target.value)
		if (props.onChange) {
			props.onChange(e)
		}
	}

	const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		field.setTouched(true)
		if (props.onBlur) {
			props.onBlur(e)
		}
	}

	const classes = props.className?.split(" ") || []
	if (field.touched) {
		classes.push("formup-touched")
	}
	if (field.error) {
		classes.push("formup-error")
	}

	return (
		<input
			{...props}
			type={field.type}
			name={field.name}
			value={field.value}
			className={classes.join(" ")}
			onBlur={onBlur}
			onChange={onChange}
		/>
	)
}

export interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
	form: FormSettings
}

export function Form({ form, ...props }: FormProps) {
	return <form {...props} onSubmit={form.onSubmit} />
}
