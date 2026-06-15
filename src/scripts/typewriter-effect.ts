class TypewriterEffect {
	private element: HTMLElement;
	private texts: string[];
	private currentTextIndex = 0;
	private speed: number;
	private deleteSpeed: number;
	private pauseTime: number;
	private currentIndex = 0;
	private isDeleting = false;

	constructor(element: HTMLElement) {
		this.element = element;
		const textData = element.dataset.text || "";

		try {
			const parsed = JSON.parse(textData);
			this.texts = Array.isArray(parsed) ? parsed : [textData];
		} catch {
			this.texts = [textData];
		}

		this.speed = Number.parseInt(element.dataset.speed || "100", 10);
		this.deleteSpeed = Number.parseInt(
			element.dataset.deleteSpeed || "50",
			10,
		);
		this.pauseTime = Number.parseInt(
			element.dataset.pauseTime || "2000",
			10,
		);

		if (this.texts.length > 1 && !this.isTypewriterEnabled()) {
			this.showRandomText();
		} else {
			this.start();
		}
	}

	private isTypewriterEnabled(): boolean {
		return (
			this.element.dataset.speed !== undefined ||
			this.element.dataset.deleteSpeed !== undefined ||
			this.element.dataset.pauseTime !== undefined
		);
	}

	private showRandomText() {
		const randomIndex = Math.floor(Math.random() * this.texts.length);
		this.element.textContent = this.texts[randomIndex];
	}

	private start() {
		if (this.texts.length === 0) {
			return;
		}
		this.type();
	}

	private getCurrentText(): string {
		return this.texts[this.currentTextIndex] || "";
	}

	private type() {
		const currentText = this.getCurrentText();

		if (this.isDeleting) {
			if (this.currentIndex > 0) {
				this.currentIndex--;
				this.element.textContent = currentText.substring(
					0,
					this.currentIndex,
				);
				window.setTimeout(() => this.type(), this.deleteSpeed);
			} else {
				this.isDeleting = false;
				this.currentTextIndex =
					(this.currentTextIndex + 1) % this.texts.length;
				window.setTimeout(() => this.type(), this.speed);
			}
			return;
		}

		if (this.currentIndex < currentText.length) {
			this.currentIndex++;
			this.element.textContent = currentText.substring(
				0,
				this.currentIndex,
			);
			window.setTimeout(() => this.type(), this.speed);
			return;
		}

		if (this.texts.length > 1) {
			this.isDeleting = true;
			window.setTimeout(() => this.type(), this.pauseTime);
		} else if (this.texts.length === 1 && this.texts[0] === "") {
			this.element.innerHTML = "&nbsp;";
		}
	}
}

function initTypewriters() {
	document.querySelectorAll(".typewriter").forEach((element) => {
		if (!(element instanceof HTMLElement)) {
			return;
		}
		if (element.dataset.typewriterInitialized === "true") {
			return;
		}
		element.dataset.typewriterInitialized = "true";
		new TypewriterEffect(element);
	});
}

const typewriterWindow = window as Window & {
	__typewriterEffectRegistered?: boolean;
};

if (!typewriterWindow.__typewriterEffectRegistered) {
	typewriterWindow.__typewriterEffectRegistered = true;
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initTypewriters);
	} else {
		initTypewriters();
	}
	document.addEventListener("swup:contentReplaced", initTypewriters);
}
