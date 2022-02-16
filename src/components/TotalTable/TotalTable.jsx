import { useEffect, useState } from "react";
import style from "./TotalTable.module.css";


const TotalTable = ({ guests, moneyToCollect,
	setMoneyToCollect, setGuestsWithDebt, guestsWithDebt }) => {
	const [totalOrder, setTotalOrder] = useState()
	const [moneyCollected, setMoneyCollected] = useState(0)
	useEffect(() => {
		setTotalOrder(moneyToCollect)
	}, [])

	function payOrder(guest) {
		let newGuestsWithDebt = guestsWithDebt.filter(guest => guest.shareToPay > 0);
		let newGuests = guestsWithDebt.map(one => {
			if (one.name === guest.name) {
				if (newGuestsWithDebt.length > 1) {
					setMoneyToCollect(prevMoneyToCollect => (prevMoneyToCollect - one.shareToPay).toFixed(1))
					setMoneyCollected(prev => (+prev + +one.shareToPay).toFixed(1))
				} else {
					setMoneyToCollect(prevMoneyToCollect => Math.round(prevMoneyToCollect - one.shareToPay))
					setMoneyCollected(totalOrder)
				}

				return {
					...one,
					shareToPay: 0
				}
			} else {

				return { ...one }
			}
		})
		setGuestsWithDebt(newGuests);


	}




	let tableRows = guestsWithDebt.map((guest, index) => <tr key={guest.name + index}>
		{guest.isVegan ? <td className={style.vegan}>{guest.name}</td> :
			<td>{guest.name}</td>}
		<td>{guest.shareToPay} BYN</td>
		<td>{guest.shareToPay > 0 ? <button onClick={payOrder.bind(null, guest)} className={style.table__button}>PAY</button> :
			<button className={style.table__button + " " + style.disabledButton} disabled>PAID</button>}</td>
	</tr>
	)

	return <div className={style.totalTable__container}>
		<div className={style.title} >
			<div>Name</div>
			<div>Share to pay</div>
			<div>Pay</div>
		</div>

		<table className={style.table}>
			<tbody>
				{tableRows}
			</tbody>
		</table>

		<table className={style.totalTable__results}>
			<tbody>
				<tr>
					<td>Total order</td>
					<td>{totalOrder} BYN</td>

				</tr>
				<tr>
					<td>Money to collect:</td>
					<td>{moneyToCollect} BYN</td>

				</tr>
				<tr>
					<td>Money collected:</td>
					<td>{moneyCollected} BYN</td>

				</tr>

			</tbody>
		</table>
	</div >
}


export default TotalTable;