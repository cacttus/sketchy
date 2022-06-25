import React, { useState, FC, Component, useRef,ReactNode, ForwardedRef } from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import TimePicker from 'react-time-picker'
import DateTimePicker from 'react-datetime-picker'
import 'react-time-picker/dist/TimePicker.css'
import 'react-datetime-picker/dist/DateTimePicker.css'
import 'react-calendar/dist/Calendar.css'
import 'react-clock/dist/Clock.css'
import { Remote } from "./Remote";
import './MaterialIcons.scss';

//https://bobbyhadz.com/blog/props-state-types
//difference?
//type x = {} vs interface x { yz }
type NumericUpDownProps = {
  value: number;
  children?: ReactNode;
}
type CheckboxProps = {
  label: string;
  defaultChecked: boolean;
  children?: ReactNode;
};
export class Controls {
  public static NumericUpDown: React.FC<NumericUpDownProps> = React.forwardRef((props: NumericUpDownProps, ref : ForwardedRef<HTMLInputElement>) => {
    const [value, setValue] = useState(0);
    return (
        <input ref={ref} type="number" min={0} max={999} className="w-25" placeholder={'' + props.value} value={value} onChange={e => setValue(+e.target.value)} />
    );
  });
  public static Checkbox: React.FC<CheckboxProps> = (props: CheckboxProps) => {
    const [value, setValue] = useState(0);
    const [label, setLabel] = useState('');
    const myRef = useRef(null);
    return (
      <div className="form-check">
        <input ref={myRef} className="form-check-input" type="checkbox" id="flexCheckDefault"
          defaultChecked={props.defaultChecked} onChange={e => setValue(+e.target.value)} />
        <label className="form-check-label" htmlFor="flexCheckDefault">
          {props.label}
        </label>
      </div>
    );
  };
}
