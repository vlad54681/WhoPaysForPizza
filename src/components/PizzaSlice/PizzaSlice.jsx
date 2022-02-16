import style from "./PizzaSlice.module.css";


const PizzaSlice = ({ eaters, guests }) => {
	let totalMembers = guests.length;

	let totalEaters = eaters.length;
	let slices = totalEaters / 2;
	let deg = Math.round(360 / totalEaters);
	let pieces = [];
	for (let i = 0; i < slices; i++) {
		pieces.push(i + 1)
	}
	let a = pieces.map((el, index) => <div className={style.circle} key={index}>
		<li style={{ transform: `rotate(${[el * deg]}deg)` }} ></li >
	</div >)


	return <div className={style.pizzaSlice__container}>
		<div className={style.pizzaSlice}>
			<ul className={style.pizzaSlice__cake}>
				{a}
			</ul>
		</div>
		<div className={style.pizzaSlice__eaters}>
			<div className={style.pizzaSlice__text}>There are {totalMembers} party members,<br />but pizza is only for {totalEaters} :)</div>
		</div>
	</div>
}

export default PizzaSlice;