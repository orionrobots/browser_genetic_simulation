/**
 * @author danny
 */

/**
 * Create a scenario object.
 *
 * @param population_size           The size of the total population.
 * @param normalised_mutation_rate  The mutation rate in the scenario.
 * @param {environment} current_environment       An object representing the environmental state
 */
function scenario(population_size, normalised_mutation_rate, current_environment){
    this.population_size = population_size;
    this.normalised_mutation_rate = normalised_mutation_rate;
    this.generation = new Array();
    this.current_environment = current_environment;
	if(this.current_environment.predatory_factor + this.current_environment.bad_luck_factor > this.population_size) {
		logger.write("Bad parameters!");
		return;
	}
	this.timerSpeed = 50;

	this.timer = new Ext.util.DelayedTask();	
    
    for (var count = 0; count < this.population_size; count++) {
        var individual = new organism(10, 20, 30);
        this.generation.push(individual);
    }
	this.killed = 0;
    
    logger.write("Initialised with " + this.generation.length + " individuals.");
	
	/**
	 * Prevent the scenario progressing any further.
	 */
	this.stop = function() {
		this.timer.cancel();
	}
	
	/**
	 * Sorting function for organism fitness in this scenario.
	 * 
	 * @param {Object} b
	 * @param {Object} a
	 */
	this._prepare_sort_fitness = function() {
		var thisObj = this;
		this.sort_fitness = function(b, a){
			/* See which is numerically closer to the environment */
			var aVal = thisObj.current_environment.individual_suits_environment(a);
			var bVal = thisObj.current_environment.individual_suits_environment(b);
			return aVal - bVal;
		}
	}	
	this._prepare_sort_fitness();
	
	/**
	 * Perform one step through the generation.
	 * 
	 * @param {Function} phase_callback 	A function to call at each part of the phase.
	 * 					this allows a renderer to do something at that point.
	 * 		phase_callback has two params - state and any returned params.
	 * 		states:
	 * 			kill_unlucky 		- ignore parameter
	 * 			individual_unlucky	- parameter is index of dead individual
	 * 			killed_unlucky		- ignore parameter
	 * 			start_eating		- ignore parameter
	 * 			individual_eaten	- parameter is index of dead individual
	 * 			done_eating			- ignore parameter
	 * 			start_breeding 		- ignore parameter
	 * 			breeder_added		- parameter is index of the individual
	 * 			pair_bred			- parameter is array of the 1st individual index,
	 * 									and the second individual index.
	 * 			done_breeding		- ignore parameter
	 */
	this.step = function (phase_callback) {
		this.killed = 0;
		this.phase_callback = phase_callback;
		logger.write("Sorting by fitness");
		/* Now reverse sort the array by fitness */
		this.generation.sort(this.sort_fitness);
		this.phase_callback('kill_unlucky', false);
		/* First kill a few unlucky ones dead */
		this.timer.delay(this.timerSpeed , this.huntUnlucky, this);
	}
	
	/**
	 * Hunt for unlucky individuals.
	 */
	this.huntUnlucky = function () {
		if (this.killed < this.current_environment.bad_luck_factor) {
			unlucky_num = Math.round(Math.random() * (this.generation.length - 1));
			if (this.generation[unlucky_num].state == "alive") {
				this.generation[unlucky_num].state = "unlucky";
				this.killed += 1;
				this.phase_callback('individual_unlucky', unlucky_num);
				this.timer.delay(this.timerSpeed, this.huntUnlucky, this);			
			} else {
				this.timer.delay(1, this.huntUnlucky, this);				
			}
		} else {
			this.phase_callback('killed_unlucky', false);
			
			/* Yield a little and then carry on into the eating phase */
			this.timer.delay(this.timerSpeed, this.eatPhase, this);
		}
	}
	
	/**
	 * Try to eat one unlucky individual and carry on.
	 * 
	 * Utility function. Called as part of the step sequence.
	 */
	this.eatOne = function(){
		var count = 0;
		/* This still (at least in populations above 10) favours eating the weakest 
		 * individuals, but is slightly randomised.
		 */
		var skip_factor = 1 + (this.generation.length / this.current_environment.predatory_factor - 1);
		this.eatOneWorker = function () {
			var ateOne = false;
			logger.write("Going to eat one of " + this.generation.length + " count is " + count);
			if (this.generation[count].state == 'alive') {
				this.generation[count].state = 'eaten';
				this.eaten++;
				ateOne = true;
				this.phase_callback('individual_eaten', count);
			}
			if(this.eaten < this.current_environment.predatory_factor) {
				count+= Math.round(Math.random() * skip_factor);
				count %= this.generation.length;
				if (ateOne) {
					this.timer.delay(this.timerSpeed, this.eatOneWorker, this);
				} else {
					this.timer.delay(1, this.eatOneWorker, this);
				}
			} else {
				logger.write(this.eaten + " Individuals eaten");
				this.phase_callback('done_eating', false);
				logger.write("Done eating...");
				this.timer.delay(this.timerSpeed , this.breedPhase, this);						
			}
		}
		
		this.timer.delay(this.timerSpeed , this.eatOneWorker, this);
	}
	
	/**
	 * This is called as part of the step routine to handle the eating phase.
	 */
	this.eatPhase = function(){
		this.phase_callback('start_eating', false);
		/* Eat a few */
		this.eaten = 0;
		this.timer.delay(this.timerSpeed , this.eatOne, this);
	}

	/**
	 * This is where the fun starts....
	 * 
	 * The predators have already filtered out (possibly) the weak.
	 */
	this.breedPhase = function() {
		this.phase_callback('start_breeding', false);
		var breeders=new Array();
		var breederIndexes=new Array();
		var new_generation = new Array();
		var count = 0;
		
		/**
		 *  Sort the breeders from the duds
		 */
		this.sortBreeders = function() {
			var bredOne = false;
			if(count < this.population_size) {
				if(this.generation[count].state == 'alive') {
					breeders.push(this.generation[count]);
					breederIndexes.push(count);
					this.phase_callback('breeder_added', count);
					bredOne = true;
				}
				count ++;
				if (bredOne) {
					this.timer.delay(this.timerSpeed, this.sortBreeders, this);
				} else {
					this.timer.delay(1, this.sortBreeders, this);					
				}
			} else {
				logger.write(breeders.length + " breedable organisms in this generation");		
				count = 0;
				this.timer.delay(this.timerSpeed , this.breedNewGeneration, this);				
			}
		}
		
		/**
		 * While thenumber of children is less than the generation size, 
		 * breed more.
		 */
		this.breedNewGeneration = function() {
			if(count < this.population_size) {
				/* YES it is possible for one to breed with itself */
				var mother_num = Math.round(Math.random() * (breeders.length-0.5));
				var father_num = Math.round(Math.random() * (breeders.length-0.5));
				logger.write(breeders[father_num].state);
				var new_child = breeders[father_num].breed(breeders[mother_num], 
					this.normalised_mutation_rate);
				this.phase_callback('pair_bred', new Array(breederIndexes[mother_num], breederIndexes[father_num]));
				new_generation.push(new_child);
				count ++;
				this.timer.delay(this.timerSpeed , this.breedNewGeneration, this);
			} else {
				/* All bred */
				/* And thus starts the next generation */
				this.generation = new_generation;
				this.phase_callback('done_breeding', false);				
			}
		}
		
		this.timer.delay(this.timerSpeed , this.sortBreeders, this);
	}
}
