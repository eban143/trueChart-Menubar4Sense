import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {EXTENSION_NAME} from '../entry';

// default options
const _options: ToastOptions = {
	opacity: 0.9,
	closeButton: true,
	timeOut: 5000,
	extendedTimeOut: 2000
};

const _containerStyle: React.CSSProperties = {
		position: 'absolute',
		bottom: 0,
		right: '1em',
		left: '1em',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end'
	},
	_toastStyle: React.CSSProperties = {
		width: '100%',
		maxWidth: '300px',
		padding: '0.25em 0.25em 0.25em 0.5em',
		margin: 'auto 0 1em auto',
		boxShadow: '0 0 10px 0px darkgrey'
	},
	_iconStyle: React.CSSProperties = {
		minWidth: '1.125em',
		textAlign: 'center'
	},
	_closeIconStyle: React.CSSProperties = {
		position: 'absolute',
		top: '0.5em',
		right: '0.5em',
		cursor: 'pointer'
	},
	_textStyle: React.CSSProperties = {
		flexDirection: 'column',
		alignItems: 'flex-start'
	},
	_titleStyle: React.CSSProperties = {
		marginBottom: '5px',
		fontWeight: 'bold',
		fontSize: '1.1em'
	},

	_toastClass = 'flex-container a-i-center lui-toast',

	_iconClasses: { [type: string]: string } = {
		'info': 'fa-info',
		'success': 'fa-check',
		'warning': 'fa-exclamation-triangle',
		'danger': 'fa-bolt'
	};

export class Toast extends React.Component<ToastProps, { opacity: number }> {
	private _containerClass: string;
	private _iconClass: string;
	private _timer: number;

	constructor(props: ToastProps){
		super(props);

		const toast = this.props.toast;

		this.state = {opacity: toast.options.opacity};
		this._containerClass = _toastClass + (toast.type ? ' lui-bg-' + toast.type : '');
		this._iconClass = 'fa fa-lg ' + _iconClasses[toast.type];

		// bind 'this' object to event handler methods
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.close = this.close.bind(this);
	}

	/**
	 * Handles mouse enter events
	 */
	onMouseEnter(){
		window.clearTimeout(this._timer);
		this.setState({opacity: 1});
	}

	/**
	 * Handles mouse leave events
	 */
	onMouseLeave(){
		const options = this.props.toast.options;
		this._timer = window.setTimeout(this.close, options.extendedTimeOut);
		this.setState({opacity: options.opacity});
	}

	/**
	 * Handles "close" event, triggered by timeOut or click on close button
	 */
	close(){
		window.clearTimeout(this._timer);
		this.props.onClose(this.props.toast);
	}

	componentDidMount(){
		this._timer = window.setTimeout(this.close, this.props.toast.options.timeOut);
	}

	render(){
		const toast = this.props.toast,
			tStyle = Object.assign({}, _toastStyle, {opacity: this.state.opacity});

		return (
			<div className={this._containerClass} style={tStyle} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
				<i className={this._iconClass} style={_iconStyle}/>
				<div className={'lui-toast__text'} style={_textStyle}>
					{toast.title && <div className={'toast-title'} style={_titleStyle}>{toast.title}</div>}
					<div className={'toast-message'}>{toast.message}</div>
				</div>
				{toast.options.closeButton && <i className={'fa fa-close'} style={_closeIconStyle} onClick={this.close}/>}
			</div>
		);
	}
}

export class Toastr extends React.Component<{}, { toasts: ToastDefinition[] }> {
	private static _instance: Toastr;
	private static _idCounter = -1;

	constructor(props: any, state: { toasts: ToastDefinition[] }){
		super(props, state);

		Toastr._instance = this;
		this.state = {toasts: []};

		this._onClose = this._onClose.bind(this);
	}

	/**
	 * Makes a new toast depending on given type, message, title and options
	 *
	 * @param {string} type
	 * @param {string} message
	 * @param {string} title
	 * @param {ToastOptions} options
	 */
	private static _makeToast(type: string, message: string, title: string = EXTENSION_NAME, options?: ToastOptions){
		const toast: ToastDefinition = {id: this._idCounter++, type, message, title, options: Object.assign({}, _options, options)},
			toasts = this.Instance.state.toasts.slice();

		toasts.push(toast);
		this.Instance.setState({toasts: toasts});
	}

	/**
	 * Handles onClose events
	 * @param {ToastDefinition} toast
	 */
	private _onClose(toast: ToastDefinition){
		const toasts = this.state.toasts.slice();

		toasts.splice(toasts.indexOf(toast), 1);
		this.setState({toasts: toasts});
	}

	/**
	 * Returns a Toastr instance
	 *
	 * @return {Toastr}
	 */
	static get Instance(){
		if(!this._instance){
			this.createInstance();
		}
		return this._instance;
	}

	/**
	 * Creates a new Toastr (DOM) instance
	 */
	static createInstance(){
		const div: HTMLElement = document.createElement('div');

		div.className = 'hico hico-lui hico-fa';
		document.body.appendChild(div);
		ReactDOM.render(<Toastr/>, div);
	}

	/**
	 * Create a success toast
	 *
	 * @param {string} message
	 * @param {string} title
	 * @param {ToastOptions} options
	 */
	static success(message: string, title?: string, options?: ToastOptions){
		this._makeToast('success', message, title, options);
	}

	/**
	 * Create an info toast
	 *
	 * @param {string} message
	 * @param {string} title
	 * @param {ToastOptions} options
	 */
	static info(message: string, title?: string, options?: ToastOptions){
		this._makeToast('info', message, title, options);
	}

	/**
	 * Create a warning toast
	 *
	 * @param {string} message
	 * @param {string} title
	 * @param {ToastOptions} options
	 */
	static warning(message: string, title?: string, options?: ToastOptions){
		this._makeToast('warning', message, title, options);
	}

	/**
	 * Create an error toast
	 *
	 * @param {string} message
	 * @param {string} title
	 * @param {ToastOptions} options
	 */
	static error(message: string, title?: string, options?: ToastOptions){
		this._makeToast('danger', message, title, options);
	}

	/**
	 * Create a simple (black) toast
	 *
	 * @param {string} message
	 * @param {string} title
	 * @param {ToastOptions} options
	 */
	static show(message: string, title?: string, options?: ToastOptions){
		this._makeToast('', message, title, options);
	}

	render(){
		return (
			<div style={_containerStyle}>
				{this.state.toasts.map(toast => <Toast toast={toast} onClose={this._onClose} key={toast.id}/>)}
			</div>
		);
	}
}

type ToastProps = {
	toast: ToastDefinition;
	onClose: Function;
};

interface ToastDefinition {
	id: number;
	type: string;
	message: string;
	title?: string;
	options?: ToastOptions;
}

interface ToastOptions {
	closeButton?: boolean;
	extendedTimeOut?: number;
	opacity?: number;
	timeOut?: number;
}