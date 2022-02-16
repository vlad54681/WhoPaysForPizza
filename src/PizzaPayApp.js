import style from './PizzaPayApp.module.css';
import StartButton from './components/StartButton/StartButton';
import TotalTable from './components/TotalTable/TotalTable';
import PizzaSlice from './components/PizzaSlice/PizzaSlice';
import { useState } from 'react';



const PizzaPayApp = () => {
	const [loadingPhase, setLoadingPhase] = useState(0);
	const [guests, setGuests] = useState();
	const [moneyToCollect, setMoneyToCollect] = useState(0);
	const [eaters, setEaters] = useState(0);
	const [guestsWithDebt, setGuestsWithDebt] = useState();
	const [shareToPay, setShareToPay] = useState();



	const getData = async () => {
		setLoadingPhase(1)

		let partyGuests = await fetchPartyGuests();
		let guestsArr = partyGuests.party;
		setGuests(guestsArr)
		let partyGuestsDiets = await fetchPartyGuestDiets(guestsArr)
		let guestsDietsArr = partyGuestsDiets.diet;

		const guests = guestsArr.map(guest => {
			return {
				...guest,
				isVegan: guestsDietsArr.find(friend => friend.name === guest.name).isVegan
			}

		});

		const eatersArr = guests.filter(guest => guest.eatsPizza)
		const totalEaters = eatersArr.length;
		const totalVeganEaters = guests.filter(guest => guest.isVegan).length;
		const totalMeatEaters = guests.filter(guest => !guest.isVegan).length;

		setEaters(eatersArr)

		let pizzaType;
		if (totalVeganEaters > totalMeatEaters) {
			pizzaType = (Math.random() > 0.5) ? 'vegan' : 'cheese';
		} else {
			pizzaType = 'meat';
		}


		let results = await Promise.all([
			fetchDrinksOrder(guests.length),
			fetchPizzaOrder(totalEaters, pizzaType),
			fetchCurrencyExchange()
		]);
		let drinksOrderCheck = results[0]
		let pizzaOrderCheck = results[1];
		let exchangeRates = results[2];


		let shareToPayObj = calculateShareToPay(drinksOrderCheck, pizzaOrderCheck, exchangeRates, totalEaters, guests)
		setShareToPay(shareToPayObj);


		let guestsWithDebtArr = guests.map(guest => {
			if (guest.eatsPizza) {
				return {
					...guest,
					shareToPay: (+shareToPayObj.sharedToPayForPizza + +shareToPayObj.sharedToPayForDrinks).toFixed(1)

				}
			} else {
				return {
					...guest,
					shareToPay: shareToPayObj.sharedToPayForDrinks
				}

			}
		})





		setGuestsWithDebt(guestsWithDebtArr)
		setGuests(guestsWithDebtArr)
		setLoadingPhase(2)
	}


	function calculateShareToPay(checkForDrinks, checkForPizza, exchangeRates, totalEaters, guests) {


		let sharedToPayForPizza = exchengeCurrency(checkForPizza, exchangeRates)
		let sharedToPayForDrinks = exchengeCurrency(checkForDrinks, exchangeRates)
		let totalOrder = (sharedToPayForPizza + sharedToPayForDrinks)
		let sharedToPayForPizzaForOne = (sharedToPayForPizza / totalEaters)
		let sharedToPayForDrinksForOne = (sharedToPayForDrinks / guests.length)

		setMoneyToCollect(totalOrder.toFixed(1))
		return {
			pizzaCost: (sharedToPayForPizza).toFixed(1),
			drinksCost: (sharedToPayForDrinks).toFixed(1),
			totalOrder: (totalOrder).toFixed(1),
			sharedToPayForPizza: (sharedToPayForPizzaForOne).toFixed(1),
			sharedToPayForDrinks: (sharedToPayForDrinksForOne).toFixed(1)
		}

	}

	function exchengeCurrency(cost, exchangeRates) {
		let sharedToPay;
		let currency;
		let value = parseFloat(cost.price)

		for (let key in exchangeRates) {
			if (cost.price.includes(key)) currency = key;
		}
		if (cost === "BYN") {
			sharedToPay = value

		} else {
			sharedToPay = value * exchangeRates[currency]

		}
		return sharedToPay
	}

	async function fetchCurrencyExchange() {

		const currencyExchangeUrl = "https://gp-js-test.herokuapp.com/pizza/currency";
		let exchangeRates = await fetchData(currencyExchangeUrl);
		return exchangeRates

	}

	async function fetchDrinksOrder(guestsAmount) {

		const drinksOrderUrl = "https://gp-js-test.herokuapp.com/pizza/order-cola/";
		const drinksOrderUrlWithDesc = drinksOrderUrl + guestsAmount;
		const encodedDrinksOrderUrl = encodeURI(drinksOrderUrlWithDesc);
		let drinksOrderDesc = await fetchData(encodedDrinksOrderUrl);
		return drinksOrderDesc
	}

	async function fetchPizzaOrder(eatersAmount, pizzaType) {

		const pizzaOrderUrl = "https://gp-js-test.herokuapp.com/pizza/order/";
		const pizzaOrderUrlWithDesc = pizzaOrderUrl + pizzaType + '/' + eatersAmount;
		const encodedPizzaOrderUrl = encodeURI(pizzaOrderUrlWithDesc);
		let pizzaOrderDesc = await fetchData(encodedPizzaOrderUrl);
		return pizzaOrderDesc
	}

	async function fetchPartyGuestDiets(guests) {

		const partyGuestDietsUrl = 'https://gp-js-test.herokuapp.com/pizza/world-diets-book';
		const guestNamesData = guests.map(guest => guest.name).join(',');
		const partyGuestDietsUrlWithNames = partyGuestDietsUrl + '/' + guestNamesData;
		const encodedPartyGuestsUrl = encodeURI(partyGuestDietsUrlWithNames);
		let partyGuestsDiets = await fetchData(encodedPartyGuestsUrl);
		return partyGuestsDiets
	}

	async function fetchPartyGuests() {

		const partyGuestsUrl = 'https://gp-js-test.herokuapp.com/pizza/guests';
		let partyGuests = await fetchData(partyGuestsUrl);
		return partyGuests
	}

	async function fetchData(url) {
		let data;
		try {
			const response = await fetch(url);
			const responseData = await response.json();
			data = responseData;
		} catch (e) {
			console.error(e)
		}
		return data
	}


	return (
		<div className={style.pizzaPayApp}>

			{
				(loadingPhase === 0) ?
					<StartButton getData={getData}>LET'S PIZZA!!!</StartButton>
					:
					(loadingPhase === 1) ? <StartButton getData={getData}>Loading...</StartButton> :
						<>
							<PizzaSlice eaters={eaters} guests={guests} />
							<TotalTable setGuestsWithDebt={setGuestsWithDebt}
								guestsWithDebt={guestsWithDebt}
								shareToPay={shareToPay}
								moneyToCollect={moneyToCollect}
								setMoneyToCollect={setMoneyToCollect}
								guests={guests}
							/>
						</>
			}



		</div >
	);
}

export default PizzaPayApp;
