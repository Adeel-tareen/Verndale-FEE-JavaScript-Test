"use strict";

import "../sass/app.scss";

//-- Autocomplete component
const searchBox = document.getElementsByClassName("search-box").item(0);
const searchInput = document.querySelector("input");
const ul = document.querySelector("ul");
const lis = ul.getElementsByTagName("li");
const icon = document.getElementsByClassName("icon").item(0);
const clearList = () => {
	ul.innerHTML = "";
	ul.classList.remove("overflowed");
};
icon.addEventListener("click", () => {
	searchInput.value = "";
	clearList();
	icon.classList.add("hide");
});

let index;

const selectItem = (selected) => {
	searchInput.value = selected.innerText;
	clearList();
};
// find selected option in the suggestion list
const findSelectedLi = () => {
	let selected;
	let selectedIndex = -1;
	for (const [k, v] of Object.entries(lis)) {
		const li = lis.item(parseInt(k));
		if (li.classList.contains("selected")) {
			selected = li;
			selectedIndex = parseInt(k);
		}
	}
	return [selected, selectedIndex];
};

// handle up, down and enter event
document.addEventListener("keydown", (event) => {
	let selected;
	// find selected list item
	[selected, index] = findSelectedLi();
	if (event.key === "ArrowDown" || event.key === "ArrowUp") {
		if (selected && index !== -1) {
			selected && selected.classList.remove("selected");
		}

		// on arrow up decrement index and increment on arrow down to select in the list
		event.key === "ArrowUp" ? index-- : index++;
		if (index < 0) {
			index = 0;
		}
		if (index > lis.length - 1) {
			index = lis.length - 1;
		}
		const li = lis.item(index);
		li.classList.add("selected");
		if (lis.length > 5) {
			if (index > 4) searchBox.scrollTop = li.offsetTop - 32;
			else {
				searchBox.scrollTop = 0;
			}
		}
	}
	if (event.key === "Enter") {
		selectItem(selected);
	}
});
// debounce to delay in firing the api call, defaults to 300 ms
function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => func.apply(this, args), timeout);
	};
}

// API call in XMLHttpRequest
const getSearchSuggestions = (value) => {
	return new Promise((resolve, reject) => {
		try {
			const req = new XMLHttpRequest();
			req.addEventListener("load", function () {
				resolve(JSON.parse(this.responseText));
			});

			// req.setRequestHeader('Content-type', 'application/json')
			req.open("GET", `/api/states?term=${value}`);
			req.send();
		} catch (e) {
			reject(e);
		}
	});
};

// load response and create suggestions
const loadSuggestions = (response) => {
	searchBox.innerHTML = "";
	const length = response.data.length;
	response.data.forEach((d, i) => {
		const li = document.createElement("li");
		console.log("data", d);
		li.value = i;
		li.setAttribute("abbreviation", d.abbreviation);
		li.textContent = d.name;

		li.addEventListener("mouseover", ({ target }) => {
			const [selected] = findSelectedLi();
			selected && selected.classList.remove("selected");
			target.classList.add("selected");
		});
		li.addEventListener("mousedown", ({ target }) => {
			selectItem(target);
		});
		searchBox.append(li);
	});

	if (length > 5) {
		searchBox.classList.add("overflowed");
	} else {
		searchBox.classList.remove("overflowed");
	}
};

searchInput.addEventListener("input", (event) => {
	const value = event.target.value;

	if (value.length >= 2) {
		icon.classList.remove("hide");
		debounce(() =>
			getSearchSuggestions(event.target.value).then(loadSuggestions)
		)();
	} else {
		icon.classList.add("hide");
	}
});
