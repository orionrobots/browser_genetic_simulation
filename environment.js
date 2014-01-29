/**
 * @author danny
 */
/** 
 * Define some kind of environment the organisms are meant to live in here.
 *
 * @param {Number} r                 How red the environment is.
 * @param {Number} g                 How green the environment is.
 * @param {Number} b                 How blue the environment is.
 * @param {Number} predatory_factor  How many individuals a predator eats in a generation.
 * @param {Number} bad_luck_factor	How many individuals will die simply from bad luck.
 */
function environment(r, g, b, predatory_factor, bad_luck_factor){
    this.r = new Number(r);
    this.g = new Number(g);
    this.b = new Number(b);
    this.predatory_factor = new Number(predatory_factor);
	this.bad_luck_factor = new Number(bad_luck_factor);

	/**
	 * Check for the suitability of an individual to the current
	 * environment. A number will be returned which shows the deviation.
	 * 
	 * Higher numbers mean less suited individuals.
	 * 
	 * @param {organism} individual 	The individual to be tested.
	 * @return {Number} How far the individual is from the environment.
	 */
	this.individual_suits_environment = function (individual) {
		var factor = 0;
		/* No weighting is given to a particular trait here */
		factor = Math.abs(individual.r - this.r);
		factor += Math.abs(individual.g - this.g);
		factor += Math.abs(individual.b - this.b);
		return factor;
	}
}