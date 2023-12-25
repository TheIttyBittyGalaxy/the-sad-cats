// PLAYERS & TRACKS //
const players = [];
const tracks = [];

const playing = [];
const audio_a = [];
const audio_b = [];

for (const elem of document.querySelectorAll(".player")) {
	const player = {
		elem: elem,
		name: elem.id,
		tracks: [],
	};

	const photo = elem.querySelector(".photo");

	// Base Images
	{
		const a = document.createElement("img");
		a.src = `code/img/${player.name}-a/${player.name}-base-a.png`;
		a.classList.add("cycle-a");
		a.classList.add("base");
		photo.appendChild(a);

		const b = document.createElement("img");
		b.src = `code/img/${player.name}-b/${player.name}-base-b.png`;
		b.classList.add("cycle-b");
		b.classList.add("base");
		photo.appendChild(b);
	}

	for (const button of elem.querySelectorAll("button")) {
		const track = {
			elem: button,
			instrument: button.dataset.instrument,
			scheduled: false,
			player: player,
		};

		// Images
		{
			const a = document.createElement("img");
			a.src = `code/img/${player.name}-a/${player.name}-${track.instrument}-a.png`;
			a.classList.add("cycle-a");
			a.classList.add(track.instrument);
			photo.appendChild(a);

			const b = document.createElement("img");
			b.src = `code/img/${player.name}-b/${player.name}-${track.instrument}-b.png`;
			b.classList.add("cycle-b");
			b.classList.add(track.instrument);
			photo.appendChild(b);
		}

		// Audio
		const a = new Audio();
		const b = new Audio();
		a.preload = "auto";
		b.preload = "auto";
		a.src = `code/sounds/${player.name}-${track.instrument}-a.ogg`;
		b.src = `code/sounds/${player.name}-${track.instrument}-b.ogg`;

		// a.controls = "true";
		// b.controls = "true";
		document.body.appendChild(a);
		document.body.appendChild(b);

		// Button
		button.dataset.playing = false;
		button.dataset.scheduled = false;

		button.addEventListener("click", event => {
			track.scheduled = !track.scheduled;
			button.dataset.scheduled = track.scheduled;

			if (track.scheduled) {
				if (track.instrument == "microphone") {
					for (const other of player.tracks) {
						if (other.instrument == "trumpet") {
							other.scheduled = false;
							other.elem.dataset.scheduled = false;
						}
					}
				} else if (track.instrument == "trumpet") {
					for (const other of player.tracks) {
						if (other.instrument == "microphone") {
							other.scheduled = false;
							other.elem.dataset.scheduled = false;
						}
					}
				} else if (track.instrument == "keys") {
					for (const other of player.tracks) {
						if (other.instrument == "drums") {
							other.scheduled = false;
							other.elem.dataset.scheduled = false;
						}
					}
				} else if (track.instrument == "drums") {
					for (const other of player.tracks) {
						if (other.instrument == "keys") {
							other.scheduled = false;
							other.elem.dataset.scheduled = false;
						}
					}
				}
			}
		});

		player.tracks.push(track);
		tracks.push(track);

		playing.push(false);
		audio_a.push(a);
		audio_b.push(b);
	}

	players.push(player);
}

// PROGRESS BAR //

const progress = document.getElementById("progress");
const progressInner = document.getElementById("progress-inner");

// MAIN LOOP //

let nextBeatTime = 0;
let nextCycleTime = 0;
let isFirstBeat = false;
let isFirstCycle = false;
const beatLen = 4800;

function loop() {
	const currentTime = performance.now();

	if (currentTime >= nextCycleTime) {
		isFirstCycle = !isFirstCycle;
		document.body.dataset.cycle = isFirstCycle ? "a" : "b";
		nextCycleTime += beatLen / 8;
	}

	const p =
		Math.max(0, Math.min(1 - Math.max((nextBeatTime - currentTime) / beatLen), 1)) * 100 + "%";

	if (currentTime >= nextBeatTime) {
		isFirstBeat = !isFirstBeat;
		progress.dataset.first = isFirstBeat;
		progressInner.style.width = p;

		for (let i = 0; i < tracks.length; i++) {
			const track = tracks[i];
			const p = track.scheduled;
			playing[i] = p;
			track.elem.dataset.playing = p;

			if (p) {
				track.player.elem.classList.add(track.instrument);
			} else {
				track.player.elem.classList.remove(track.instrument);
			}
		}

		if (isFirstBeat) {
			for (let i = 0; i < tracks.length; i++) {
				if (playing[i]) {
					audio_a[i].duration = (nextBeatTime - performance.now()) / 1000;
					audio_a[i].play();
				}
			}
		} else {
			for (let i = 0; i < tracks.length; i++) {
				if (playing[i]) {
					audio_b[i].duration = (nextBeatTime - performance.now()) / 1000;
					audio_b[i].play();
				}
			}
		}

		nextBeatTime += beatLen;
	} else {
		progressInner.style.width = p;
	}

	requestAnimationFrame(loop);
}

const section = document.querySelector("section");
let started = false;
section.addEventListener("click", event => {
	section.classList.add("fade");
	if (!started) {
		started = true;
		setTimeout(() => {
			section.remove();
			nextBeatTime = performance.now();
			nextCycleTime = nextBeatTime;
			loop();
		}, 1000);
	}
});
