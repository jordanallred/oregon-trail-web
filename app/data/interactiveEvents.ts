// File: app/data/interactiveEvents.ts

// Collection of interactive events with multiple choices and outcomes
const INTERACTIVE_EVENTS = [
    {
        id: 'broken_wagon',
        title: 'Broken Wagon',
        description: 'Your wagon has broken down in rough terrain. One of the wheels is damaged, and the axle has a crack. The nearest fort is still 30 miles away.',
        choices: [
            {
                text: 'Try to repair it yourself (requires spare parts)',
                outcome: 'You managed to repair the wagon using your spare parts. It took an entire day, but the wagon seems sturdy enough to continue.',
                effect: (gameState: any) => {
                    // Check if player has necessary parts
                    if (gameState.spareWheels > 0 && gameState.spareAxles > 0) {
                        // Create a new date object to avoid mutation
                        const newDate = new Date(gameState.date);
                        newDate.setDate(newDate.getDate() + 1);

                        return {
                            spareWheels: gameState.spareWheels - 1,
                            spareAxles: gameState.spareAxles - 1,
                            date: newDate
                        };
                    } else {
                        // If no parts, still lose a day but take damage
                        const newDate = new Date(gameState.date);
                        newDate.setDate(newDate.getDate() + 1);

                        return {
                            date: newDate,
                            messages: [...gameState.messages, "You don't have the necessary spare parts. Your makeshift repairs will slow down your journey."]
                        };
                    }
                }
            },
            {
                text: 'Push on despite the damage',
                outcome: 'You decide to continue with the damaged wagon. Progress is much slower, and the constant jolting is wearing everyone down.',
                effect: (gameState: any) => {
                    // Make random party member health worse
                    const updatedParty = gameState.party.map((member: any) => {
                        if (member.health === 'good' && Math.random() < 0.3) {
                            return { ...member, health: 'fair' as const };
                        } else if (member.health === 'fair' && Math.random() < 0.3) {
                            return { ...member, health: 'poor' as const };
                        }
                        return member;
                    });

                    return {
                        party: updatedParty,
                        // Slow down by damaging oxen health
                        oxen: Math.max(1, gameState.oxen - 1)
                    };
                }
            },
            {
                text: 'Ask the group to help push the wagon to the fort',
                outcome: 'The entire group pushes the wagon for miles. It\'s exhausting work that takes several days, but you eventually reach the fort where proper repairs can be made.',
                effect: (gameState: any) => {
                    // Calculate days based on party size and health
                    const healthyMembers = gameState.party.filter((m: any) => m.health === 'good').length;
                    const daysNeeded = Math.max(3, Math.ceil(5 - (healthyMembers * 0.5)));

                    // Create new date
                    const newDate = new Date(gameState.date);
                    newDate.setDate(newDate.getDate() + daysNeeded);

                    // Everyone's health deteriorates
                    const updatedParty = gameState.party.map((member: any) => {
                        if (member.health === 'good') {
                            return { ...member, health: 'fair' as const };
                        } else if (member.health === 'fair') {
                            return { ...member, health: 'poor' as const };
                        }
                        return member;
                    });

                    // Consume more food due to hard work
                    const extraFoodConsumed = gameState.party.length * daysNeeded;

                    return {
                        party: updatedParty,
                        date: newDate,
                        food: Math.max(0, gameState.food - extraFoodConsumed),
                        miles: gameState.miles + 30, // Skip ahead to the fort
                    };
                }
            }
        ]
    },
    {
        id: 'native_encounter',
        title: 'Native American Encounter',
        description: 'Your party has encountered a group of Native Americans. They approach your wagon and appear to be interested in trade.',
        choices: [
            {
                text: 'Offer to trade supplies',
                outcome: 'The trading goes well. You exchange some clothing and ammunition for fresh food and valuable information about the trail ahead.',
                effect: (gameState: any) => {
                    return {
                        clothing: Math.max(0, gameState.clothing - 2),
                        ammunition: Math.max(0, gameState.ammunition - 10),
                        food: gameState.food + 50,
                        // Give a small boost to travel distance for the next few days
                        messages: [...gameState.messages, "The Native Americans showed you a shortcut that will save you some travel time."]
                    };
                }
            },
            {
                text: 'Keep your distance and move on',
                outcome: 'You decide not to engage and continue on your journey. The group watches as you pass by but does not follow.',
                effect: (gameState: any) => {
                    // No direct effect except for message
                    return {
                        messages: [...gameState.messages, "You continue on the established trail."]
                    };
                }
            },
            {
                text: 'Share your food and medicine',
                outcome: 'Your generosity is appreciated. In return, they offer guidance on hunting in this region and help repair some of your equipment.',
                effect: (gameState: any) => {
                    return {
                        food: Math.max(0, gameState.food - 20),
                        // Fix one random part
                        spareWheels: gameState.spareWheels + (Math.random() < 0.33 ? 1 : 0),
                        spareAxles: gameState.spareAxles + (Math.random() < 0.33 && Math.random() >= 0.33 ? 1 : 0),
                        spareTongues: gameState.spareTongues + (Math.random() >= 0.66 ? 1 : 0),
                        // Bonus to hunting for a while
                        messages: [...gameState.messages, "You've learned valuable hunting techniques that will help you in the future."]
                    };
                }
            }
        ]
    },
    {
        id: 'wild_fruit',
        title: 'Wild Fruit Found',
        description: 'Your party has discovered what appears to be wild berries and fruit. They look delicious and would supplement your food supplies.',
        choices: [
            {
                text: 'Gather as much as possible',
                outcome: 'Your party spends time gathering plenty of fruit. It\'s a nice addition to your food supplies.',
                effect: (gameState: any) => {
                    // Random chance of illness
                    const illnessChance = Math.random();

                    if (illnessChance < 0.2) {
                        // Someone gets sick
                        const updatedParty = gameState.party.map((member: any, index: number) => {
                            // Only affect one random party member
                            if (index === Math.floor(Math.random() * gameState.party.length) && member.health !== 'dead') {
                                return { ...member, health: 'poor' as const };
                            }
                            return member;
                        });

                        return {
                            food: gameState.food + 20,
                            party: updatedParty,
                            messages: [...gameState.messages, "Some of the fruit wasn't safe to eat. One of your party members has fallen ill."]
                        };
                    } else {
                        // Everything goes fine
                        return {
                            food: gameState.food + 30
                        };
                    }
                }
            },
            {
                text: 'Cautiously gather a small amount to test first',
                outcome: 'You carefully select and test a small amount of fruit before gathering more. A wise decision that ensures safety.',
                effect: (gameState: any) => {
                    // Delay by half a day
                    const newDate = new Date(gameState.date);
                    newDate.setHours(newDate.getHours() + 12);

                    return {
                        food: gameState.food + 15,
                        date: newDate
                    };
                }
            },
            {
                text: 'Ignore them and continue on the trail',
                outcome: 'You decide not to risk it and continue on your journey without delay.',
                effect: (gameState: any) => {
                    // No effect
                    return {};
                }
            }
        ]
    },
    {
        id: 'river_crossing_ice',
        title: 'Icy River Crossing',
        description: 'The river ahead is partially frozen. Crossing here looks dangerous, but going around will add many miles to your journey.',
        choices: [
            {
                text: 'Attempt to cross on the ice',
                outcome: 'You carefully lead your wagon onto the ice...',
                effect: (gameState: any) => {
                    // High risk, high reward
                    const crossingSuccess = Math.random();

                    if (crossingSuccess < 0.4) {
                        // Disaster
                        const foodLost = Math.floor(gameState.food * 0.3);
                        const suppliesLost = Math.floor(gameState.ammunition * 0.3);

                        // Someone might get hurt or die
                        const updatedParty = gameState.party.map((member: any, index: number) => {
                            // Only affect one random party member
                            if (index === Math.floor(Math.random() * gameState.party.length) && member.health !== 'dead') {
                                if (Math.random() < 0.3) {
                                    return { ...member, health: 'dead' as const };
                                } else {
                                    return { ...member, health: 'poor' as const };
                                }
                            }
                            return member;
                        });

                        return {
                            food: Math.max(0, gameState.food - foodLost),
                            ammunition: Math.max(0, gameState.ammunition - suppliesLost),
                            party: updatedParty,
                            messages: [...gameState.messages, "The ice cracked! Your wagon partially fell through, and you lost supplies. There were injuries in your party."]
                        };
                    } else {
                        // Success - save time
                        return {
                            messages: [...gameState.messages, "You successfully crossed the frozen river, saving valuable time on your journey."]
                        };
                    }
                }
            },
            {
                text: 'Look for a safer crossing point',
                outcome: 'You spend time searching up and down the river for a safer place to cross.',
                effect: (gameState: any) => {
                    // Moderate delay, moderate risk
                    const newDate = new Date(gameState.date);
                    newDate.setDate(newDate.getDate() + 2);

                    return {
                        date: newDate,
                        food: Math.max(0, gameState.food - (gameState.party.length * 2 * 2)), // 2 days of food
                        messages: [...gameState.messages, "After two days, you found a safer place to cross the river."]
                    };
                }
            },
            {
                text: 'Take the long way around',
                outcome: 'You decide that safety is more important than speed and take the long route around the river.',
                effect: (gameState: any) => {
                    // Long delay but safe
                    const newDate = new Date(gameState.date);
                    newDate.setDate(newDate.getDate() + 5);

                    return {
                        date: newDate,
                        food: Math.max(0, gameState.food - (gameState.party.length * 2 * 5)), // 5 days of food
                        messages: [...gameState.messages, "The detour took 5 days, but you avoided the dangerous river crossing."]
                    };
                }
            }
        ]
    },
    {
        id: 'abandoned_wagon',
        title: 'Abandoned Wagon',
        description: 'You\'ve come across an abandoned wagon off the side of the trail. It appears to have been deserted recently.',
        choices: [
            {
                text: 'Search for supplies',
                outcome: 'You search the wagon for useful supplies.',
                effect: (gameState: any) => {
                    // Random chance to find different items
                    const findFood = Math.random() < 0.6;
                    const findParts = Math.random() < 0.4;
                    const findAmmo = Math.random() < 0.3;
                    const findMoney = Math.random() < 0.2;

                    // Chance of disease
                    const diseaseRisk = Math.random();

                    let updates: any = {};
                    let foundMessage = "You found ";

                    if (findFood) {
                        const foodAmount = Math.floor(Math.random() * 30) + 10;
                        updates.food = gameState.food + foodAmount;
                        foundMessage += `${foodAmount} pounds of food`;
                    }

                    if (findParts) {
                        // Choose a random part to find
                        const partType = Math.floor(Math.random() * 3);
                        if (partType === 0) {
                            updates.spareWheels = gameState.spareWheels + 1;
                            foundMessage += foundMessage.endsWith("food") ? ", a spare wheel" : "a spare wheel";
                        } else if (partType === 1) {
                            updates.spareAxles = gameState.spareAxles + 1;
                            foundMessage += foundMessage.endsWith("food") ? ", a spare axle" : "a spare axle";
                        } else {
                            updates.spareTongues = gameState.spareTongues + 1;
                            foundMessage += foundMessage.endsWith("food") ? ", a spare tongue" : "a spare tongue";
                        }
                    }

                    if (findAmmo) {
                        const ammoAmount = Math.floor(Math.random() * 20) + 5;
                        updates.ammunition = gameState.ammunition + ammoAmount;
                        foundMessage += foundMessage.includes("food") || foundMessage.includes("spare") ?
                            `, and ${ammoAmount} bullets` : `${ammoAmount} bullets`;
                    }

                    if (findMoney) {
                        const moneyAmount = Math.floor(Math.random() * 15) + 5;
                        updates.money = gameState.money + moneyAmount;
                        foundMessage += foundMessage.includes("food") || foundMessage.includes("spare") || foundMessage.includes("bullets") ?
                            `, and $${moneyAmount}` : `$${moneyAmount}`;
                    }

                    // If nothing was found
                    if (foundMessage === "You found ") {
                        foundMessage = "You found nothing useful in the wagon.";
                    } else {
                        foundMessage += ".";
                    }

                    // Check for disease
                    if (diseaseRisk < 0.15) {
                        // Someone gets sick
                        const updatedParty = gameState.party.map((member: any, index: number) => {
                            // Only affect one random party member
                            if (index === Math.floor(Math.random() * gameState.party.length) && member.health !== 'dead') {
                                return { ...member, health: 'poor' as const };
                            }
                            return member;
                        });

                        updates.party = updatedParty;
                        updates.messages = [...gameState.messages, foundMessage, "Unfortunately, someone in your party got sick after rummaging through the abandoned items."];
                    } else {
                        updates.messages = [...gameState.messages, foundMessage];
                    }

                    return updates;
                }
            },
            {
                text: 'Look for survivors',
                outcome: 'You search the area for any survivors from the wagon.',
                effect: (gameState: any) => {
                    // Small chance to find a new party member
                    const findSurvivor = Math.random() < 0.2;

                    if (findSurvivor) {
                        // Generate a random name
                        const firstNames = ['John', 'Mary', 'William', 'Sarah', 'James', 'Elizabeth', 'George', 'Martha'];
                        const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'];

                        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                        const survivorName = `${firstName} ${lastName}`;

                        // Add to party
                        const updatedParty = [...gameState.party, {
                            name: survivorName,
                            health: 'fair' as const,
                            diseases: []
                        }];

                        return {
                            party: updatedParty,
                            messages: [...gameState.messages, `You found a survivor named ${survivorName} hiding nearby. They've joined your party.`]
                        };
                    } else {
                        return {
                            messages: [...gameState.messages, "You searched the area but found no survivors. Whatever happened here, the people are long gone."]
                        };
                    }
                }
            },
            {
                text: 'Continue on your way',
                outcome: 'You decide it\'s best not to disturb the abandoned wagon and continue on your journey.',
                effect: (gameState: any) => {
                    // No effect except for message
                    return {
                        messages: [...gameState.messages, "You pass by the abandoned wagon and continue on your way."]
                    };
                }
            }
        ]
    },
    {
        id: 'hunting_party',
        title: 'Hunting Party Opportunity',
        description: 'Some of your fellow travelers invite you to join a hunting party. It could yield a lot of food, but will delay your journey.',
        choices: [
            {
                text: 'Join the hunting party (uses 10 bullets)',
                outcome: 'You join the hunting party and spend a day hunting with the group.',
                effect: (gameState: any) => {
                    // Check if enough bullets
                    if (gameState.ammunition < 10) {
                        return {
                            messages: [...gameState.messages, "You don't have enough ammunition to join the hunting party."]
                        };
                    }

                    // Calculate success based on luck
                    const huntSuccess = Math.random();
                    const newDate = new Date(gameState.date);
                    newDate.setDate(newDate.getDate() + 1);

                    if (huntSuccess < 0.2) {
                        // Poor hunt
                        return {
                            ammunition: gameState.ammunition - 10,
                            food: gameState.food + 10,
                            date: newDate,
                            messages: [...gameState.messages, "The hunting was poor. You only got a small amount of food."]
                        };
                    } else if (huntSuccess < 0.7) {
                        // Average hunt
                        return {
                            ammunition: gameState.ammunition - 10,
                            food: gameState.food + 40,
                            date: newDate,
                            messages: [...gameState.messages, "The hunting was decent. You acquired a good amount of food."]
                        };
                    } else {
                        // Great hunt
                        return {
                            ammunition: gameState.ammunition - 10,
                            food: gameState.food + 100,
                            date: newDate,
                            messages: [...gameState.messages, "The hunting was excellent! You brought back a large amount of food."]
                        };
                    }
                }
            },
            {
                text: 'Decline and continue on the trail',
                outcome: 'You decide to keep to your own schedule and continue on the trail.',
                effect: (gameState: any) => {
                    // No effect
                    return {};
                }
            },
            {
                text: 'Trade supplies for a share of the hunt',
                outcome: 'Instead of joining, you offer some supplies in exchange for a share of whatever they catch.',
                effect: (gameState: any) => {
                    // Trade clothing or money for food, no time lost
                    if (gameState.clothing > 1) {
                        // Trade clothing
                        return {
                            clothing: gameState.clothing - 1,
                            food: gameState.food + 20,
                            messages: [...gameState.messages, "You traded 1 set of clothing for 20 pounds of food from the hunting party."]
                        };
                    } else if (gameState.money >= 5) {
                        // Trade money
                        return {
                            money: gameState.money - 5,
                            food: gameState.food + 25,
                            messages: [...gameState.messages, "You traded $5 for 25 pounds of food from the hunting party."]
                        };
                    } else {
                        return {
                            messages: [...gameState.messages, "You don't have enough trading goods to get a share of the hunt."]
                        };
                    }
                }
            }
        ]
    },
    {
        id: 'thief_in_camp',
        title: 'Thief in Camp',
        description: 'You wake in the middle of the night to suspicious noises. Someone appears to be going through your supplies.',
        choices: [
            {
                text: 'Confront them with your gun',
                outcome: 'You grab your gun and confront the intruder.',
                effect: (gameState: any) => {
                    // Check if you have ammunition
                    if (gameState.ammunition <= 0) {
                        // No bullets to threaten with
                        const foodStolen = Math.floor(Math.random() * 20) + 10;
                        const moneyStolen = Math.floor(Math.random() * 10) + 5;

                        return {
                            food: Math.max(0, gameState.food - foodStolen),
                            money: Math.max(0, gameState.money - moneyStolen),
                            messages: [...gameState.messages, "Your gun is unloaded! The thief realizes this and still manages to steal some supplies before escaping."]
                        };
                    }

                    // Success
                    return {
                        ammunition: gameState.ammunition - 1, // Use 1 bullet to fire a warning shot
                        messages: [...gameState.messages, "You fire a warning shot and the thief runs away without taking anything."]
                    };
                }
            },
            {
                text: 'Yell to wake the camp',
                outcome: 'You shout loudly to alert everyone in the camp about the intruder.',
                effect: (gameState: any) => {
                    // 50/50 chance of success
                    if (Math.random() < 0.5) {
                        // Thief escapes with some supplies
                        const foodStolen = Math.floor(Math.random() * 15) + 5;

                        return {
                            food: Math.max(0, gameState.food - foodStolen),
                            messages: [...gameState.messages, `The thief manages to escape with ${foodStolen} pounds of food despite your attempt to raise the alarm.`]
                        };
                    } else {
                        // Thief runs away empty-handed
                        return {
                            messages: [...gameState.messages, "Your shouting frightens the thief, who runs away without taking anything."]
                        };
                    }
                }
            },
            {
                text: 'Remain quiet and hope they leave',
                outcome: 'You stay still and quiet, pretending to be asleep.',
                effect: (gameState: any) => {
                    // High chance of theft
                    const theftSeverity = Math.random();

                    if (theftSeverity < 0.7) {
                        // Major theft
                        const foodStolen = Math.floor(Math.random() * 30) + 20;
                        const bulletStolen = Math.floor(Math.random() * 20) + 10;
                        const moneyStolen = Math.floor(Math.random() * 15) + 5;

                        return {
                            food: Math.max(0, gameState.food - foodStolen),
                            ammunition: Math.max(0, gameState.ammunition - bulletStolen),
                            money: Math.max(0, gameState.money - moneyStolen),
                            messages: [...gameState.messages, `The thief takes their time and steals ${foodStolen} pounds of food, ${bulletStolen} bullets, and $${moneyStolen} before leaving.`]
                        };
                    } else {
                        // They leave on their own
                        return {
                            messages: [...gameState.messages, "After rummaging around for a while, the thief leaves without taking anything valuable."]
                        };
                    }
                }
            }
        ]
    },
    {
        id: 'lost_child',
        title: 'Lost Child',
        description: 'While setting up camp, you notice a young child wandering alone near your wagon. They appear to be lost and scared.',
        choices: [
            {
                text: 'Take them in and search for their family',
                outcome: 'You decide to help the lost child find their family.',
                effect: (gameState: any) => {
                    // This will delay your journey but is the moral choice
                    const searchDays = Math.floor(Math.random() * 2) + 1;
                    const newDate = new Date(gameState.date);
                    newDate.setDate(newDate.getDate() + searchDays);

                    // Extra food consumption
                    const extraFood = gameState.party.length * 2 * searchDays + 2; // +2 for the child

                    // Chance to find family
                    if (Math.random() < 0.7) {
                        // Find the family
                        return {
                            date: newDate,
                            food: Math.max(0, gameState.food - extraFood),
                            messages: [...gameState.messages, `After ${searchDays} days of searching, you find the child's family. They are extremely grateful and insist on giving you a gift.`],
                            money: gameState.money + 15 // Reward from family
                        };
                    } else {
                        // Don't find family, child joins your party
                        const updatedParty = [...gameState.party, {
                            name: Math.random() < 0.5 ? "Boy" : "Girl",
                            health: 'good' as const,
                            diseases: []
                        }];

                        return {
                            date: newDate,
                            food: Math.max(0, gameState.food - extraFood),
                            party: updatedParty,
                            messages: [...gameState.messages, `After ${searchDays} days of searching, you cannot find the child's family. With no alternative, the child joins your party.`]
                        };
                    }
                }
            },
            {
                text: 'Give them some food and point them toward the nearest settlement',
                outcome: 'You give the child some supplies and directions to the nearest settlement.',
                effect: (gameState: any) => {
                    // Give some food
                    return {
                        food: Math.max(0, gameState.food - 5),
                        messages: [...gameState.messages, "You give the child 5 pounds of food and directions to the nearest settlement. You hope they'll be alright."]
                    };
                }
            },
            {
                text: 'Ignore them and continue on your way',
                outcome: 'You decide you cannot afford to get involved and continue preparing your camp.',
                effect: (gameState: any) => {
                    // Morale penalty - represented by random health decline
                    const randomIndex = Math.floor(Math.random() * gameState.party.length);
                    const updatedParty = [...gameState.party];
                    const member = updatedParty[randomIndex];

                    if (member.health === 'good') {
                        updatedParty[randomIndex] = { ...member, health: 'fair' as const };
                    }

                    return {
                        party: updatedParty,
                        messages: [...gameState.messages, "The child eventually wanders away. That night, the mood in your camp is somber."]
                    };
                }
            }
        ]
    },
    {
        id: 'snake_pit',
        title: 'Snake Pit',
        description: 'While gathering firewood, one of your party members nearly falls into a pit full of rattlesnakes.',
        choices: [
            {
                text: 'Try to kill the snakes for food',
                outcome: 'You decide to hunt the snakes for meat.',
                effect: (gameState: any) => {
                    // Need ammunition
                    if (gameState.ammunition < 5) {
                        // Someone gets bitten
                        const randomIndex = Math.floor(Math.random() * gameState.party.length);
                        const updatedParty = [...gameState.party];
                        const member = updatedParty[randomIndex];

                        if (member.health !== 'dead') {
                            const newHealth = member.health === 'good' ? 'poor' : 'dead';
                            updatedParty[randomIndex] = { ...member, health: newHealth as any };

                            return {
                                party: updatedParty,
                                messages: [...gameState.messages, `Without enough ammunition, you try to kill the snakes with sticks. ${member.name} gets bitten multiple times and is now ${newHealth}.`]
                            };
                        }

                        return {
                            messages: [...gameState.messages, "Without enough ammunition, you wisely decide to leave the snakes alone."]
                        };
                    }

                    // Success chance
                    if (Math.random() < 0.6) {
                        return {
                            ammunition: gameState.ammunition - 5,
                            food: gameState.food + 10,
                            messages: [...gameState.messages, "You successfully kill several snakes and prepare them for eating, adding 10 pounds of meat to your supplies."]
                        };
                    } else {
                        // Someone gets bitten anyway
                        const randomIndex = Math.floor(Math.random() * gameState.party.length);
                        const updatedParty = [...gameState.party];
                        const member = updatedParty[randomIndex];

                        if (member.health !== 'dead') {
                            updatedParty[randomIndex] = { ...member, health: 'poor' as const };

                            return {
                                ammunition: gameState.ammunition - 5,
                                food: gameState.food + 5,
                                party: updatedParty,
                                messages: [...gameState.messages, `You kill a few snakes but ${member.name} gets bitten in the process and is now in poor health. You add 5 pounds of meat to your supplies.`]
                            };
                        }

                        return {
                            ammunition: gameState.ammunition - 5,
                            food: gameState.food + 5,
                            messages: [...gameState.messages, "You kill a few snakes and add 5 pounds of meat to your supplies."]
                        };
                    }
                }
            },
            {
                text: 'Carefully move away from the area',
                outcome: 'You carefully back away from the snake pit and find another spot to gather wood.',
                effect: (gameState: any) => {
                    // Safest option - small time penalty
                    const newDate = new Date(gameState.date);
                    newDate.setHours(newDate.getHours() + 3);

                    return {
                        date: newDate,
                        messages: [...gameState.messages, "You safely avoid the snakes and find another area to gather wood."]
                    };
                }
            },
            {
                text: 'Block off the pit with rocks to protect others',
                outcome: 'Your party spends time safely blocking the snake pit with heavy rocks.',
                effect: (gameState: any) => {
                    // Medium time penalty but feels good (moral choice)
                    const newDate = new Date(gameState.date);
                    newDate.setHours(newDate.getHours() + 6);

                    return {
                        date: newDate,
                        messages: [...gameState.messages, "You spend several hours making the area safe. Other travelers will be grateful for your efforts."]
                    };
                }
            }
        ]
    },
    {
        id: 'mountain_shortcut',
        title: 'Mountain Shortcut',
        description: 'A traveler tells you about a shortcut through the mountains that could save you a week of travel time, but the path is treacherous.',
        choices: [
            {
                text: 'Take the shortcut',
                outcome: 'You decide to brave the mountain shortcut.',
                effect: (gameState: any) => {
                    // High risk, high reward
                    const danger = Math.random();

                    if (danger < 0.3) {
                        // Disaster - wagon damage and possible injury
                        const randomIndex = Math.floor(Math.random() * gameState.party.length);
                        const updatedParty = [...gameState.party];
                        const member = updatedParty[randomIndex];

                        if (member.health !== 'dead') {
                            updatedParty[randomIndex] = { ...member, health: 'poor' as const };

                            return {
                                party: updatedParty,
                                spareWheels: Math.max(0, gameState.spareWheels - 1),
                                messages: [...gameState.messages, `The treacherous path led to an accident. Your wagon was damaged, and ${member.name} was injured. You lost 4 days making repairs before continuing.`],
                                date: new Date(new Date(gameState.date).setDate(gameState.date.getDate() + 4))
                            };
                        }

                        return {
                            spareWheels: Math.max(0, gameState.spareWheels - 1),
                            messages: [...gameState.messages, "The treacherous path led to an accident. Your wagon was damaged. You lost 4 days making repairs before continuing."],
                            date: new Date(new Date(gameState.date).setDate(gameState.date.getDate() + 4))
                        };
                    } else {
                        // Success - save time
                        return {
                            miles: gameState.miles + 100, // Skip ahead on the trail
                            messages: [...gameState.messages, "The shortcut was difficult but passable. You've saved significant time on your journey."]
                        };
                    }
                }
            },
            {
                text: 'Stick to the main trail',
                outcome: 'You decide that it\'s safer to stick to the main trail.',
                effect: (gameState: any) => {
                    // No effect except for message
                    return {
                        messages: [...gameState.messages, "You thank the traveler for the information but decide to stay on the main trail."]
                    };
                }
            },
            {
                text: 'Ask others at camp about the shortcut',
                outcome: 'You talk to other travelers about the mountain shortcut.',
                effect: (gameState: any) => {
                    // Get more information then make a better-informed choice
                    return {
                        messages: [...gameState.messages, "Other travelers confirm the shortcut exists, but warn that it's even more dangerous than described. They recommend avoiding it unless you're desperate to make up time."]
                    };
                }
            }
        ]
    },
    {
        id: 'disease_outbreak',
        title: 'Disease Outbreak',
        description: 'Several people in your traveling group have fallen ill with a contagious disease. There\'s risk it could spread to your party.',
        choices: [
            {
                text: 'Keep your distance from the sick',
                outcome: 'You decide to move your camp away from the ill travelers.',
                effect: (gameState: any) => {
                    // Moderate chance of avoiding disease
                    if (Math.random() < 0.7) {
                        return {
                            messages: [...gameState.messages, "You manage to avoid the illness by keeping your distance from the infected travelers."]
                        };
                    } else {
                        // Someone gets sick anyway
                        const randomIndex = Math.floor(Math.random() * gameState.party.length);
                        const updatedParty = [...gameState.party];
                        const member = updatedParty[randomIndex];

                        if (member.health !== 'dead') {
                            const newHealth = member.health === 'good' ? 'fair' : 'poor';
                            updatedParty[randomIndex] = { ...member, health: newHealth as any };

                            return {
                                party: updatedParty,
                                messages: [...gameState.messages, `Despite your precautions, ${member.name} has contracted the illness and is now in ${newHealth} health.`]
                            };
                        }

                        return {
                            messages: [...gameState.messages, "You try to keep your distance, but worry about catching the illness."]
                        };
                    }
                }
            },
            {
                text: 'Help care for the sick',
                outcome: 'You decide to help care for the ill travelers.',
                effect: (gameState: any) => {
                    // High chance of illness, but could gain a reward
                    const helpResult = Math.random();

                    if (helpResult < 0.5) {
                        // Multiple people get sick
                        const updatedParty = gameState.party.map(member => {
                            if (member.health === 'good' && Math.random() < 0.5) {
                                return { ...member, health: 'fair' as const };
                            } else if (member.health === 'fair' && Math.random() < 0.3) {
                                return { ...member, health: 'poor' as const };
                            }
                            return member;
                        });

                        return {
                            party: updatedParty,
                            messages: [...gameState.messages, "While caring for the sick, several members of your party contracted the illness."]
                        };
                    } else {
                        // Reward for helping
                        return {
                            food: gameState.food + 20,
                            money: gameState.money + 10,
                            messages: [...gameState.messages, "You help care for the sick travelers. When they recover, they share some of their supplies with you out of gratitude."]
                        };
                    }
                }
            },
            {
                text: 'Leave immediately and travel ahead of the group',
                outcome: 'You decide to break camp immediately and push ahead to avoid the disease.',
                effect: (gameState: any) => {
                    // Safest for disease, but causes exhaustion
                    const updatedParty = gameState.party.map(member => {
                        if (member.health === 'good' && Math.random() < 0.3) {
                            return { ...member, health: 'fair' as const };
                        }
                        return member;
                    });

                    // Advance on the trail
                    return {
                        party: updatedParty,
                        miles: gameState.miles + 15,
                        messages: [...gameState.messages, "You push your party hard to get ahead of the illness. Everyone is more tired than usual, but you've avoided the disease."]
                    };
                }
            }
        ]
    },
    {
        id: 'frostbitten_traveler',
        title: 'Frostbitten Traveler',
        description: 'You encounter a traveler with severe frostbite. They beg for help, saying their wagon and supplies were stolen.',
        choices: [
            {
                text: 'Take them in and share your supplies',
                outcome: 'You welcome the traveler into your wagon and share your supplies.',
                effect: (gameState: any) => {
                    // Consume extra food
                    const extraFood = 10;

                    // This could be a trap
                    if (Math.random() < 0.2) {
                        // It's a trick - they steal from you
                        return {
                            food: Math.max(0, gameState.food - 30),
                            ammunition: Math.max(0, gameState.ammunition - 15),
                            money: Math.max(0, gameState.money - 10),
                            messages: [...gameState.messages, "In the middle of the night, the 'frostbitten' traveler steals your supplies and disappears. It was all a ruse."]
                        };
                    } else {
                        // They're genuinely in need
                        return {
                            food: Math.max(0, gameState.food - extraFood),
                            messages: [...gameState.messages, "You help the traveler recover. After a few days, they thank you and continue on their journey, promising to repay your kindness someday."]
                        };
                    }
                }
            },
            {
                text: 'Give them some supplies but don\'t let them join you',
                outcome: 'You offer the traveler some supplies to help them survive.',
                effect: (gameState: any) => {
                    // Give some food and clothing
                    return {
                        food: Math.max(0, gameState.food - 10),
                        clothing: Math.max(0, gameState.clothing - 1),
                        messages: [...gameState.messages, "You give the traveler some food and a set of clothing. They thank you and head toward the nearest settlement."]
                    };
                }
            },
            {
                text: 'Decline to help',
                outcome: 'You tell the traveler you cannot spare any supplies.',
                effect: (gameState: any) => {
                    // Morale penalty
                    const randomIndex = Math.floor(Math.random() * gameState.party.length);
                    const updatedParty = [...gameState.party];
                    const member = updatedParty[randomIndex];

                    if (member.health === 'good') {
                        updatedParty[randomIndex] = { ...member, health: 'fair' as const };
                    }

                    return {
                        party: updatedParty,
                        messages: [...gameState.messages, "You regretfully decline to help. The mood in your party is gloomy that night, wondering if the traveler will survive."]
                    };
                }
            }
        ]
    }
];

export default INTERACTIVE_EVENTS;