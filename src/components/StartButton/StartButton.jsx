import style from './StartButton.module.css'


const StartButton = ({ getData, children }) => {
	let coin = Math.random();

	return <div className={style.StartButton}>
		<div className={style.StartButton__container}>
			<button
				onClick={getData}
				className={style.StartButton__button}
			>
				{children}
			</button>
		</div>


	</div >
}

export default StartButton;