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
export type FormDescriptor<T> = {
	[K in keyof T]: FieldDescriptor
}

export type Field = {
	name: string
	type: string
	value: any
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
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

export function useFormUp<T>(formDescriptor: FormDescriptor<T>, options: FormOptions) {
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
			onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
				dispatchFieldValueChange({
					fieldName: currentFieldName,
					value: e.target.value,
				}),
			onBlur: (e: React.FocusEvent<HTMLInputElement>) =>
				dispatchTouchedChange({
					fieldName: currentFieldName,
					touched: true,
				}),
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

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (options.validationSchema) {
			try {
				await options.validationSchema.validate(fieldValues, {
					abortEarly: false,
				})
				setValidationErrors({})
			} catch (ex) {
				const validationErrors = ex as Yup.ValidationError
				const convertedErrors = convertYupValidationError(validationErrors)
				setValidationErrors(convertedErrors)
				return false
			}
		}

		return options.onSubmit(e)
	}

	const form: FormSettings = {
		onSubmit,
	}

	return { fields, form }
}

export interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
	field: Field
}

export function Input({ field, ...props }: InputProps) {
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		field.onChange(e)
		if (props.onChange) {
			props.onChange(e)
		}
	}

	const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		field.onBlur(e)
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
	return <form {...props} {...form} />
}
