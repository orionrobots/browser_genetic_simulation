/**
 * @author danny
 */

/**
 * A breedable organism and its alleles.
 * No rendering code here.
 *
 * @param {Integer} r The red allele - 8 bit.
 * @param {Integer} g The green allele - 8 bit.
 * @param {Integer} b The blue allele - 8 bit.
 */
function organism(r, g, b){
    this.r = new Number(r);
    this.g = new Number(g);
    this.b = new Number(b);
    
	/* If an organism is dead, it will not be able to breed */
	this.state = "alive";
}

/**
 * Breed a single 8 bit allele.
 *
 * I realise it is contrived to seperate alleles into 8 bit components, but it
 * keeps this code simple and reusable.
 *
 * @param {Integer} mother_allele             One parent allele
 * @param {Integer} father_allele             The other parent allele
 * @param {Float}	normalised_mutation_rate  The rate at which mutations occur, normalised between 0 and 1.
 */
organism.prototype.breed_allele = function(mother_allele, father_allele, normalised_mutation_rate){
    var output = 0;
    for (var bit = 0; bit < 8; bit++) {
        var mask = Math.pow(2,bit);
        /* Use fathers */
        if (Math.random() > 0.5) {
            output |= father_allele & mask;
        }
        else { /* use mothers */
            output |= mother_allele & mask;
        }
        /* Use bit flip mutation */
        if (Math.random() < normalised_mutation_rate) {
            if (output & mask) {
                output &= !mask;
            }
            else {
                output |= mask;
            }
        }
    }
    return output;
}

/**
 * The breeding system is random - mothers gene/fathers genes may be used at any point.
 *
 * @param {organism} other						The other parent organism
 * @param {Float}	 normalised_mutation_rate	The rate at which mutations occur, normalised between 0 and 1.
 */
organism.prototype.breed = function(other, normalised_mutation_rate) {
    var new_child = new organism(
		this.breed_allele(other.r, this.r, normalised_mutation_rate), 
		this.breed_allele(other.g, this.g, normalised_mutation_rate), 
		this.breed_allele(other.b, this.b, normalised_mutation_rate));
	return new_child;
}
