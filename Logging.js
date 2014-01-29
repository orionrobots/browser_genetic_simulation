/**
 * @author danny
 */
/**
 * A logging utility.
 */
function logging_system(){
    this.log = Ext.get("log");
    this.log.insertHtml("beforeEnd", "Log initialised.<br />\n");
    
    /**
     * Write a message to this pages log.
     *
     * @param message.
     */
    this.write = function(message){
		this.log.insertHtml("beforeEnd", message + "<br />\n");
		this.log.scroll('down',200);
    }
	
	/**
	 * Clear the log.
	 */
	this.clear = function() {
		this.log.dom.innerHTML="Log cleared<br />\n";
	}
    
    /**
     * Render an evironment to the log area.
     *
     * @param environment  The environment to render.
     */
    this.dump_environment = function(current_environment){
        this.write("Environment:");
        this.write("R" + current_environment.r + ":" +
        "G" +
        current_environment.g +
        ":" +
        "B" +
        current_environment.b +
        ":" +
        "Predatory factor" +
        current_environment.predatory_factor);
    }
    
    /**
     * Render an organism to the log area.
     *
     * @param organism  The organism to render.
     */
    this.dump_organism = function(current_organism){
        this.write("Organism:");
        this.write("R" + current_organism.r + ":" +
        "G" +
        current_organism.g +
        ":" +
        "B" +
        current_organism.b);
		
		this.write("Current state: " + current_organism.state);
    }
    
    /**
     * Dump the data for all the individuals in the current scenario.
     *
     * @param current_scenario  The scenario we are dumping for.
     */
    this.dump_scenario_generation = function(current_scenario){
        for (var count = 0; count < current_scenario.generation.length; count++) {
            this.dump_organism(current_scenario.generation[count]);
        }
    }
}