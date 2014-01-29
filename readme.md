Genetic Algorithm Simulation

(Sun, 25th Nov 2007)

This is a simplistic browser based GA simulation.

Opening this in a browser with JS you will see an application with a large canvas, a toolbar at the top, a sidebar with some parameters, and a bottom area with a log message stating that the logger was initialised.

The log area gives text messages with detail on what is happening, but the main event will be in the canvas. Lets start by explaining what will happen, then putting some configuration values in.

The maximum population size is currently 100. Anything larger will not be rendered by the browser yet.

What you will be doing is a simulation, albeit a very crude one, of evolving creatures from a base point, to match their environment. They all have an RGB colour value, which is represented by three 8-bit numbers, and these bits are the genotype - that is, the information about the individuals characteristics. These genotypes are translated to actual colours, which will be rendered on the screen.

The environment they are in is a background colour. The further they are from this colour, the more likely they are to be “eaten” by an imaginary predator. The predator chooses prey at random, but it is most likely to go for the easiest target. After the predator, and some bad luck, have culled the population, the remaining number will then be selected for breeding to create the next generation. This is entirely random, and the selection of genes from the breeders is random, along with a small mutation factor which may alter one of the genes. A mutation is basically a single bit-flip.

The intention is that when the simulation is running, the population will generally drift towards the background colour as those less suited to the environment tend to be less lucky than those closer to it.

I suggest setting the mutation rate to about 0.02. Any larger, and the mutations will be too many to keep it consistent, too small and it will take a hugely long time to get there.

Set the RGB background colour to any colour you like - some will be closer to the default starting creature colour, and some further.

I suggest setting the unlucky factor to about 20. Set the predatory factor to about 40. That means that in any generation, 60% of the population will die or be eaten.

You are now ready to start the simulation. Press the “init” button on the toolbar, and you should see the generation rendered as a bunch of boxes against a coloured background. The boxes are the population, and the background is their environment.

Stepping
========

Now is where the fun starts - press the “Step” button.
You will now see 20 of the population randomly chosen as the “unlucky” deaths, they will fade away as the predators then ravage 40 individuals, who also fade. Since they are all the same colour at this point, there is no real selection going on.

The remaining population turn blue - they are now selected to breed. Then pairs of individuals will flash as they become a breeding pair. An individual may become very lucky, and breed many times, while another will be unlucky and may not get to breed at all. An individual may breed with another, or with itself.

At the end of that phase, the environment is now populated with a completely new generation. Many individuals will be the same as before, but one or two will have a different colour.

Press “step” again. This time, the colours will noticeably be sorted between the unlucky and predatory phase, so those more suitable will be at the bottom right of the screen. It is clear the predator favours those at the top left. Step a few times, and after about 5-7 generations, you should start to see them approaching the background colour.

Now try a few of your own parameters - try smaller populations (sorry it cannot yet go above 100), try different predatory and unlucky factors (they should add up to less than 100 between them), and then press “init” to apply the parameters. You can then experiment to see the effects of different settings.
What is this good for?

This is a very, very simple demonstration of a genetic algorithm. But they can be used as a way to find unusual solutions to a problem. Imagine a complex mathematical problem - including some of those that are known to be difficult for neural net learning rules to deal with, and this method may be able to find a solution where they cannot.

This makes it very effective, given preferences of better and more economical solutions, to find neat solutions. Arm the phenotype with the ability to run as some sandbox program code, and you can literally grow programs.

License
=======
The project is under:
GPL3 or CC BY SA 3.0

The libraries in lib have their own licenses - please read those too.
