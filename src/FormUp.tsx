import React, { useReducer, useState } from "react";
import * as Yup from "yup";

type FieldDescriptor = {
  type: string;
  initial: any;
};

export function text(initial: any): FieldDescriptor {
  return {
    type: "text",
    initial: initial,
  };
}

export function email(initial: any): FieldDescriptor {
  return {
    type: "email",
    initial: initial,
  };
}

export function date(initial: any): FieldDescriptor {
  return {
    type: "date",
    initial: initial,
  };
}

export type FormDescriptor = {
  [fieldName: string]: FieldDescriptor;
};

export type Field = {
  name: string;
  type: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void | Promise<void>
  className: string
};

export type Fields = {
  [fieldName: string]: Field;
};

export type FieldValues = {
  [fieldName: string]: any;
};

export type FieldValueUpdateAction = {
  fieldName: string;
  value: any;
};

export type FormOptions = {
  validationSchema?: Yup.ObjectSchema<object | undefined>;
  onSubmit: (e: React.FormEvent) => void | Promise<any>;
};

export type FormSettings = {
  onSubmit: (e: React.FormEvent) => void | Promise<any>;
};
export type FormDetails = {
  validationErrors: Yup.ValidationError | undefined;
};

export function useFormUp(
  formDescriptor: FormDescriptor,
  options: FormOptions
) {
  const [validationErrors, setValidationErrors] = useState(
    undefined as Yup.ValidationError | undefined
  );

  const fieldNames = Object.keys(formDescriptor);
  const initialValues = fieldNames.reduce((all, currentFieldName) => {
    const currentFieldDescriptor = formDescriptor[currentFieldName];
    all[currentFieldName] = currentFieldDescriptor.initial;
    return all;
  }, {} as FieldValues);

  const fieldValueChangeReducer = (state: FieldValues, action: FieldValueUpdateAction) => {
    return {
      ...state,
      [action.fieldName]: action.value,
    };
  };

  const [fieldValues, dispatchFieldValueChange] = useReducer(fieldValueChangeReducer, initialValues);

  const touchedReducer = (state: FieldValues, fieldName: string) => {
    return {
      ...state,
      [fieldName]: true,
    };
  };
  const [touched, dispatchTouchedChange] = useReducer(touchedReducer, fieldNames.reduce((prev, curr) => {
    prev[curr] = false
    return prev
  }, {} as any))

  const fields = fieldNames.reduce((all, currentFieldName) => {
    const currentFieldDescriptor = formDescriptor[currentFieldName];

    const classes: string[] = []
    if (touched[currentFieldName]) {
        classes.push("formup-touched")
    }

    all[currentFieldName] = {
      name: currentFieldName,
      type: currentFieldDescriptor.type,
      value: fieldValues[currentFieldName],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatchFieldValueChange({ fieldName: currentFieldName, value: e.target.value }),
      onFocus: (e: React.FocusEvent<HTMLInputElement>) => dispatchTouchedChange(currentFieldName),
        className: classes.join(" ")
    };
    return all;
  }, {} as Fields);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (options.validationSchema) {
      try {
        await options.validationSchema.validate(fieldValues, {
          abortEarly: false,
        });
        setValidationErrors(undefined);
      } catch (ex) {
        const validationErrors = ex as Yup.ValidationError;
        setValidationErrors(validationErrors);
      }
    }

    return options.onSubmit(e);
  };

  const form: FormSettings = {
    onSubmit,
  };

  const details: FormDetails = {
    validationErrors,
  };

  return { fields, form, details };
}

export interface InputProps extends React.HTMLAttributes<HTMLInputElement> {
  field: Field;
}

export function Input({ field, ...props }: InputProps) {
  return <input {...props} {...field} className={`${props.className} ${field.className}`} />;
}

export interface FormProps extends React.HTMLAttributes<HTMLFormElement> {
  form: FormSettings;
}

export function Form({ form, ...props }: FormProps) {
  return <form {...props} {...form} />;
}
