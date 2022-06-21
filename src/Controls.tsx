import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
//import 'moment'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
//import 'bootstrap-datetimepicker/datetimepicker.css';
//import DateRangePicker from 'react-bootstrap-daterangepicker';
//import 'bootstrap-daterangepicker/daterangepicker.css';
//import './bootstrap-datetimepicker.js'
//import './bootstrap-datetimepicker.css'
import { Remote } from "./Remote";

import TimePicker from 'react-time-picker'
import DateTimePicker from 'react-datetime-picker'
//These are the default styles.
import 'react-time-picker/dist/TimePicker.css'
import 'react-datetime-picker/dist/DateTimePicker.css'
import 'react-calendar/dist/Calendar.css'
import 'react-clock/dist/Clock.css'

export class Style {
  public static MainColor: string = "#F2F2F2";
  public static SecondaryColor: string = "#E2E2E2";
  public static TertiaryColor: string = "#D6D6D6";
}

export class Controls {
  public static DateTimePicker(props: any): JSX.Element {
    const [dvalue, donChange] = useState(new Date());
    return (
        <DateTimePicker 
       /* @ts-ignore */
        onChange={donChange} value={dvalue} />
    );
  }
  public static TimePicker(props: any): JSX.Element {
    return (
        <TimePicker 
       /* @ts-ignore */
       onChange={props.onChange} value={props.value} disableClock={true}/>
    );
  }
  public static Checkbox(props: any): JSX.Element {
    return (
      <div className="form-check">
        <input className="form-check-input" type="checkbox" id="flexCheckDefault" defaultChecked={props.defaultChecked} onChange={props.onChange} />
        <label className="form-check-label" htmlFor="flexCheckDefault">
          {props.label}
        </label>
      </div>
    );
  }
  public static StatusBar(): JSX.Element {
    return (
      <div className="row justify-content-center fixed-bottom">
        <div className="col-12">
          {/* This should really be the bootstrap main color */}
          <div color={Style.MainColor}></div>
        </div>
      </div>
    );
  }
}
