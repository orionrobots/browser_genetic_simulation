/**
 * @author danny
 */
/** Instance of the logging system */
var logger;

/** The step button */
var stepButton;

/** The stop scenario button */
var stopButton;

/** The current evolution scenario */
var current_scenario;

/** The current scenario renderer */
var renderer;

/** The content panel with the canvas */
var canvas;

/**
 * Takes three colour components, and outputs a hex colour code.
 * 
 * @param {Number} r	red
 * @param {Number} g	green
 * @param {Number} b	blue
 * 
 * @return {String} The HTML style hex code.
 */
function convert_to_colour(r, g, b) {
	if(r > 255 || g > 255 || b > 255) {
		throw Error("Parameters out of bounds");
	}
	
	return sprintf("#%02x%02x%02x", r, g, b)
	
//	var colour = (r << 16) | (g << 8) | b;
//	colour = '#' + colour.toString(16);
	
	return colour;
}

/**
 * An object designed to render a scenario.
 */
function ScenarioRenderer() {
	this.canvas = Ext.Element;
	this.columns = Number;
	this.rows = Number;
	this.scenario = scenario;
	this.hasDeferredUpdate = 0;
	/**
	 * Initialise the renderer with a new scenario.
	 * 
	 * @param {scenario} current_scenario	The scenario to use.
	 */
	this.init = function(current_scenario) {
		this.canvas = canvas.getEl();
				
		this.scenario = current_scenario;
		/* Crude way to do it - but while this is AI, 
		 * I am not going to try implement the napsack problem solution here...
		 */
		if(this.scenario.population_size < 10) {
			this.columns = 3;
			this.rows = 3;
		} else if(this.scenario.population_size < 13) {
			this.columns = 4;
			this.rows = 3;
		} else if(this.scenario.population_size < 101) {
			this.columns = 10;
			this.rows = 10;		
		}
		
		/* Delete the environment element if it exists */
		if (this.environment) {
			this.environment.remove();
		}
		/* Recreate it */
		this.environment = new Ext.Element(document.createElement('div'));
		this.environment.id = 'environment';
		this.canvas.appendChild(this.environment);

		/* Now set it to the environmental settings */
		var colour = convert_to_colour(this.scenario.current_environment.r,
									this.scenario.current_environment.g,
									this.scenario.current_environment.b);
		this.environment.applyStyles({
			width: '100%',
			height:'100%',
			background: colour
		});
		
		this.createRenderedOrganisms();
	}
	
	/**
	 * Format and fill a cell with the stats for an organism
	 * 
	 * @param {Object} cellElement
	 * @param {Object} organismItem
	 */
	this.formatOrganismCell = function(cellElement, organismItem) {
		cellElement.dom.innerHTML = organismItem.r.toString() + "," +
			organismItem.g.toString() + "," +
			organismItem.b.toString() + "<br />\n" + 
			organismItem.state;
		var colour = convert_to_colour(
			organismItem.r,
			organismItem.g,
			organismItem.b
		);
		cellElement.applyStyles({
			background: colour,
			border: '1px solid black'
		});
		if(organismItem.state=='alive') {
			cellElement.applyStyles({ color: 'white' });
		} else {
			cellElement.applyStyles({ color: 'red' });
		}
	}
	
	/**
	 * create the divs for the rendered organisms.
	 */
	this.createRenderedOrganisms = function() {
		var current_organism = 0;
		var table = new Ext.Element(document.createElement('table'));
		table.applyStyles({
			width: '100%',
			height: '100%'
		});
		this.organisms = new Ext.Element(document.createElement('tbody'));
		for(var row = 0; row < this.rows; row++ ) {
			var current_row = new Ext.Element(document.createElement('tr'));
			for(var col =0; col < this.columns; col++) {
				var current_cell = new Ext.Element(document.createElement('td'));
				if(current_organism < this.scenario.population_size) {
					current_cell.dom.setAttribute('id','organism' + current_organism);
					var current_organism_item = this.scenario.generation[current_organism];
					this.formatOrganismCell(current_cell, current_organism_item);
					current_organism ++;
				} else {
					current_cell.dom.innerHTML = '&nbsp;';					
					current_cell.addClass('no_organism');
					current_cell.applyStyles({
						border: 'none'
					});
				}
				current_row.appendChild(current_cell);
			}
			this.organisms.appendChild(current_row);
		}
		table.appendChild(this.organisms);
		this.environment.appendChild(table);
	}
	
	this.killOrganism = function(index) {
		var cellElement = Ext.get('organism' + index);		
		var item = this.scenario.generation[index];
		this.formatOrganismCell(cellElement, item);
		
		cellElement.setVisible(false, {
			duration: 0.5,
			endOpacity: .25
		});
	}
	
	/**
	 * called by newGeneration to check until all cells are finished animating.
	 * 
	 * @param {Object} cellElement
	 * @param {Object} item
	 * @param {Object} callback_when_done
	 */
	this.pollCell = function (cellElement, item, callback_when_done) {
		if (cellElement.hasActiveFx()) {
			/* Keep on waiting */
			this.pollCell.defer(50, this, new Array(cellElement, item, callback_when_done));
		} else {
			this.hasDeferredUpdate--;
			logger.write("has Deferred update " + this.hasDeferredUpdate);
			if(this.hasDeferredUpdate == 0) {
				callback_when_done();
			}
		}
	}
	
	/**
	 * Called to reset and prepare all cells.
	 * 
	 * @param {Object} callback_when_done
	 */
	this.resetCells = function(callback_when_done) {
		Ext.each(this.scenario.generation, function(item, index, allitems) {
			var cellElement = Ext.get('organism' + index);
			cellElement.stopFx()
			cellElement.setVisible(true);
			this.formatOrganismCell(cellElement, item);
		}, this);
		callback_when_done();
	}
	
	/**
	 * Handle rendering a new generation.
	 * 
	 * @param {Object} callback_when_done	This function will be called when render is
	 * 	done.
	 */
	this.newGeneration = function (callback_when_done) {
		this.hasDeferredUpdate = 0;
		Ext.each(this.scenario.generation, function(item, index, allitems) {
			var cellElement = Ext.get('organism' + index);
			if (cellElement.hasActiveFx()) {
				this.hasDeferredUpdate++;
				this.pollCell.defer(50, this, new Array(cellElement, item, function () {
						this.resetCells(callback_when_done);
					}.createDelegate(this)));
			}
		}, this);
		if(this.hasDeferredUpdate == 0) {
			this.resetCells(callback_when_done);			
		}
	}
	
	/**
	 * Update these after it is all sorted.
	 */
	this.realUpdate = function() {
		Ext.each(this.scenario.generation, function(item, index, allitems) {
			var cellElement = Ext.get('organism' + index);
			this.formatOrganismCell(cellElement, item);
		}, this);
		this.environment.repaint();		
	}
	
	/**
	 * Update all the organisms
	 */
	this.updateAllOrganisms = function() {
		this.hasDeferredUpdate = 0;
		Ext.each(this.scenario.generation, function(item, index, allitems) {
			var cellElement = Ext.get('organism' + index);
			if (cellElement.hasActiveFx()) {
				this.hasDeferredUpdate++;
				this.pollCell.defer(50, this, new Array(cellElement, item, 
					this.realUpdate.createDelegate(this)));
			}
		}, this);
		if(this.hasDeferredUpdate == 0) {
			this.realUpdate();
		}
	}
	
	this.breederAdded = function(index) {
		var cellElement = Ext.get('organism' + index);
		cellElement.applyStyles({color: 'blue'});
	}
	
	this.pairBred = function(breeders) {
		var cellElement = Ext.get('organism' + breeders[0]);
		cellElement.highlight('ffff9c',{
			duration: 0.1
		});
		cellElement = Ext.get('organism' + breeders[1]);
		cellElement.highlight('ffff9c',{
			duration: 0.1
		});
	}
}

/**
 * Test creation, and display of parameters of a single organism
 */
function test_organism(){
    var current_organism = new organism(10, 101, 102);
    logger.dump_organism(current_organism);
}

/**
 * Initialises a new scenario.
 *
 * This will wipe away past generations and history, and start a fresh set./
 * It assumes inputs have been validated.
 */
function init_scenario(){
	// Get parameters from the page
    var population_size = Ext.getDom("population_size").value;
    logger.write("Population size is " + population_size);
    var mutation_rate = Ext.getDom("mutation_rate").value;
    logger.write("Mutation rate is " + mutation_rate);
	// Initialise environment
    var current_environment = new environment(
		Ext.getDom("environmental_r").value, 
		Ext.getDom("environmental_g").value, 
		Ext.getDom("environmental_b").value, 
		Ext.getDom("predatory_factor").value,
		Ext.getDom("bad_luck_factor").value);
    logger.dump_environment(current_environment);
	// Construct the scenario
    current_scenario = new scenario(population_size, mutation_rate, current_environment);
    logger.dump_scenario_generation(current_scenario);
	// Enable the step button
	stepButton.enable();
	renderer.init(current_scenario);
}

function step_into_scenario(){
	logger.write("Stepping once...");
	// Enable the stop button
	stopButton.enable();
	// Disable the step button
	stepButton.disable();
	current_scenario.step( function (state, params) {
		logger.write(state);
		switch(state) {
	 		case 'individual_unlucky':
			case 'individual_eaten': {
				renderer.killOrganism(params);
				break;
			}
			case 'breeder_added': {
				renderer.breederAdded(params);
				break;
			}
			case 'pair_bred': {
				renderer.pairBred(params);
				break;
			}

			case 'done_breeding': {
				renderer.newGeneration(function () {
					stopButton.disable();
					stepButton.enable();					
				});
				break;			
			}
			case 'killed_unlucky':
			case 'done_eating': {
				logger.dump_scenario_generation(current_scenario);					
				/* Fall through is deliberate! */
			}
			case 'kill_unlucky':
	 		case 'start_eating': {
				renderer.updateAllOrganisms();
				break;
			}
			case 'start_breeding': {
				renderer.updateAllOrganisms();
				break;
			}
		}
	});
}

function stop_scenario() {
	logger.write("stopping...");
	current_scenario.stop();
}

function about_evolving(e) {
	Ext.MessageBox.show({
		title: 'About Evolving',
		msg: Ext.get('about_text').dom.innerHTML,
		width: 400,
		buttons: Ext.MessageBox.OK,
		animEl: Ext.get(e.target)
	});
}

function config_dialog() {
	/* Show the parameters as a dialog */
	
}

/**
 * Prepare the toolbar
 */
function prepare_toolbar() {
	/* create toolbar */
	var tb = new Ext.Toolbar('toolbar');
	
	tb.addButton({
		text: 'Configure',
		handler: config_dialog
	});
	tb.addButton({
		text: 'Test',
		handler: test_organism
	});
	tb.addButton({
		text: 'Init',
		handler: init_scenario
	})
	
	stepButton = new Ext.Toolbar.Button({
		text: 'Step',
		handler: step_into_scenario,
		disabled: true
	});
	tb.addButton(stepButton);
	
	stopButton = new Ext.Toolbar.Button({
		text: 'Stop',
		handler: stop_scenario,
		disabled: true
	});
	tb.addButton(stopButton);
	tb.addButton({
		text: 'Clear Log',
		handler: function(){
			logger.clear();
		}
	});
	tb.addButton({
		text: 'About',
		handler: about_evolving
	});
	
	return tb;
}

Ext.onReady(function(){	
    Ext.QuickTips.init();
	renderer = new ScenarioRenderer();
	var current_toolbar = prepare_toolbar();
	
	var layout = new Ext.BorderLayout(document.body, {
		east: {
			split: true,
			animate: true,
			collapsedTitle: 'Parameters',
			title:'Parameters',
			collapsible: true,
			initialSize: 200,
			showPin: true
		},
		center: {
			title: 'Evolution',			
			autoScroll: true
		},
		south: {
			split: true,
			autoScroll: true,
			initialSize: 200,
			title: 'Log',
			collapsedTitle: 'log',
			collapsible: true,
			showPin: true,
			animate: true
		}
		
	});
	
    layout.beginUpdate();
    layout.add('east', new Ext.ContentPanel('parameters', {fitToFrame:true}));
	
	canvas =  new Ext.ContentPanel('canvas',{fitToFrame:true, toolbar: current_toolbar});
	
    layout.add('center', canvas);
	layout.add('south', new Ext.ContentPanel('log', {fitToFrame:true}));
    layout.endUpdate();
	
    logger = new logging_system();
});
