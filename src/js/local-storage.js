
class LocalStorage {
	constructor({ key }) {
		this.key = key;

		let item = localStorage.getItem(this.key);

		try {
			item = JSON.parse(item);
		} catch (error) {}

		if (item == null) {
			item = {};
		}

		this.value = item;
	}

	get(name, defaultValue = undefined) {
		return this.value[name] == undefined ? defaultValue : this.value[name];
	}

	set(name, value) {
		this.value[name] = value;
		this.save();
	}

	save() {
		localStorage.setItem(this.key, JSON.stringify(this.value));
	}
}

export default LocalStorage;
