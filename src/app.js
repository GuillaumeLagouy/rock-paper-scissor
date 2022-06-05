import { gsap } from "gsap";
import {io} from "socket.io-client";

const Client = {};
Client.socket = io.connect();
// localhost:8081
console.log(Client)

const cards = [...document.querySelectorAll(".card")];

const crtCard = document.querySelector('.current-area .empty');

cards.forEach((card) => {
	card.addEventListener("click", (e) => {
		console.log(e.target.dataset.card);
		let x = e.target.getBoundingClientRect().x - crtCard.getBoundingClientRect().x;
		let y = e.target.getBoundingClientRect().y - crtCard.getBoundingClientRect().y;

		gsap.to(e.target, {
			x: -x, y: -y,
		})
	});
});
