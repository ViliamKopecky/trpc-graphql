
export class TypeDescription {
	constructor(public name?: string, public description?: string) { }

	toString() {
		return this.description ?? this.name ?? ''
	}
}
