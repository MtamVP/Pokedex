const inputPkm = document.querySelector("#inputPkm");
const searchBtn = document.querySelector("#searchBtn");
const pkm_id = document.querySelector(".pkm-id");
const pkm_name = document.querySelector(".pkm-name");
const pkm_types =  document.querySelector(".pkm-types");
const img = document.createElement('img');
const abilities_list = document.querySelector(".abilities-list");
const stats_list = document.querySelector(".stats-list");
const pkm_weight = document.querySelector(".pkm-weight");
const pkm_height = document.querySelector(".pkm-height");
const heldItem = document.querySelector(".held-items-list");
const moveList = document.querySelector(".moves-list");
const evolution = document.querySelector(".evo-pipeline");
const formList = document.querySelector(".form-list");

const path_1 = "https://pokeapi.co/api/v2/pokemon/";
let path_6 = "";

function clarifyName(name){
    if(name.startsWith("mega ")){
        let part = name.split(" ");
        if(part.length === 2){
            name = `${parts[1]}-mega`;
        }
        else if(part.length === 3){
            name = `${part[1]}-mega-${part[2]}`;
        }
    }
    return name;
}



async function fetchData() {
    let clean_name = inputPkm.value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
    clean_name = clarifyName(clean_name);    
    const fullPath = path_1 + clean_name;
    if(!clean_name) return;
    pkm_id.textContent = "Đang tải...";
    pkm_name.textContent = "";
    pkm_types.innerHTML = "";
    abilities_list.innerHTML = "";
    stats_list.innerHTML = "";
    heldItem.innerHTML = "";
    moveList.innerHTML = ""; 
    img.src = "";
    img.alt = "";
    evolution.innerHTML = "";
    formList.innerHTML = "";
    try{
        const response = await fetch(fullPath)
        if(!response.ok){
            throw new Error("Failed to fetch data!!!");
        }
        const data = await response.json();
        pkm_id.textContent = `ID:#${data.id}`;
        pkm_name.textContent = data.name;
        img.src = data.sprites.front_default;
        img.alt = `Pokemon ${data.name}`;
        const pkm_img = data.sprites.front_default;
        const pkm_alt = `Pokemon ${data.name} Image`;
        pkm_id.after(img);
        pkm_weight.textContent = `Weight: ${data.weight}kg`;
        pkm_height.textContent = `Height: ${data.height}m`;
        data.types.forEach(t => {
            pkm_types.innerHTML += `<p class="type-badge ${t.type.name}">${t.type.name}</p>`;
        });
        for(const a of data.abilities){
            let ability_name = a.ability.name;
            let ability_data = await fetchAbilities(ability_name);
            if(ability_data){
                let effect = ability_data.effect_entries.length > 0 ? ability_data.effect_entries.find(entry => entry.language.name === 'en').short_effect : '--';
                abilities_list.innerHTML += `
                <span class="ability-badge"
                data-effect="${effect}">
                    ${ability_name}
                </span>`
            }
        };

        let total = 0;
        data.stats.forEach(s =>{
            let stat_name = s.stat.name;
            let stat_val = s.base_stat;
            total += stat_val;
            if(stat_name === "special-attack") stat_name = "sp.atk";
            if(stat_name === "special-defense") stat_name = "sp.def";
            let percent = (stat_val/255)*100;
            if(percent > 100) percent = 100;

            stats_list.innerHTML += `
                <div class="stat-row">
                    <span class="stat-label">${stat_name}</span>
                    <span class="stat-value">${stat_val}</span>
                    <div class="stat-bar-container">
                        <div class="stat-bar-fill" style="width: ${percent}%">
                    </div>
                    
                </div>
            `;
        });

        stats_list.innerHTML += `
        <div class="stat-row>
            <span class="stat-label">Total:</span>
            <span class="stat-value">${total}</span>
        </div>`;

        for(const h of data.held_items){
            let item_name = h.item.name;
            let item_data = await fetchItem(item_name);
            if(item_data){
                let sprite = item_data.sprites.default;
                let attribute = item_data.attributes.length > 0 ? item_data.attributes[0].name : '--';
                let category = item_data.category.name !== null ? item_data.category.name : '--';
                let effect = item_data.effect_entries.length > 0 ? item_data.effect_entries.find(entry => entry.language.name === 'en').short_effect : '--';

                heldItem.innerHTML += `
                    <div class="held-item-box">
                        <img src="${sprite}" alt="${item_name}">
                        <span class="item-badge"
                            data-attribute="${attribute}"
                            data-category="${category}"
                            data-effect="${effect}">
                            ${item_name}   
                        </span>
                    </div>
                `;
            }
        };

       for (const m of data.moves) {
            let move_name = m.move.name;
            let moveData = await fetchMoves(move_name); 
            
            if (moveData) {
                let move_type = moveData.type.name;
                let power = moveData.power !== null ? moveData.power : '--';
                let accuracy = moveData.accuracy !== null ? moveData.accuracy : '--';
                let pp =  moveData.pp !== null ? moveData.pp : '--';
                let priority = moveData.priority !== null ? moveData.priority : '--';
                let dmg_class = moveData.damage_class.name !== null ? moveData.damage_class.name : '--';
                let target = moveData.target.name !== null ? moveData.target.name : '--';

                moveList.innerHTML += `
                    <span class="move-badge ${move_type}" 
                          data-type="${move_type}" 
                          data-power="${power}" 
                          data-accuracy="${accuracy}"
                          data-pp="${pp}"
                          data-prio="${priority}"
                          data-dmg="${dmg_class}"
                          data-target="${target}">
                        ${move_name}
                    </span>
                `;
            }
        };

        
        const spec_data = await fetchSpec(data.species.name); 
        
        if(spec_data && spec_data.evolution_chain){
            path_6 = spec_data.evolution_chain.url;
            const evo_data = await fetchEvo(path_6);
            
            if(evo_data){
                let current_stage = evo_data.chain;

                while (current_stage) {
                    let evo_name = current_stage.species.name;
                    let res = await fetch(path_1 + evo_name);
                    let info = await res.json();
                    let evo_img = info.sprites.front_default;
                    
                    evolution.innerHTML += `
                        <div class="evo-stage" onclick="goToPokemon('${info.name}')">
                            <img src="${evo_img}" alt="${info.name}">
                            <span class="evo-name">${info.name}</span>
                        </div>
                    `;

                    if (current_stage.evolves_to.length > 0) {
                        evolution.innerHTML += `<div class="evo-arrow">➔</div>`;
                        current_stage = current_stage.evolves_to[0];
                    } else {
                        current_stage = null; 
                    }
                }
            }
        }
        
        if(spec_data && spec_data.varieties) {
            for(const f of spec_data.varieties){
                if(!f.is_default){
                    let path_demo = f.pokemon.url;
                    let res = await fetch(path_demo);
                    let info = await res.json();
                    let form_img = info.sprites.front_default;
                    
                    if (form_img) {
                        let clean_name = info.name.replace(/-/g, ' ');
                        formList.innerHTML += `
                            <div class="form-stage" onclick="goToPokemon('${info.name}')">
                                <img src="${form_img}" alt="${info.name}">
                                <span class="form-name" style="text-transform: capitalize; font-size: 0.8rem;">${clean_name}</span>
                            </div>
                        `;
                    }
                }
            }
        }
        

    }catch(err){
        pkm_id.textContent = `${err.message}`;
        pkm_name.textContent = "Cannot find pokemon!";
        img.src = "";
        img.alt = "Pokemon Image";
        pkm_types.innerHTML = "";
        abilities_list.innerHTML = "";
        stats_list.innerHTML = ""; 
        heldItem.innerHTML = "";
        moveList.innerHTML = "";
        evolution.innerHTML = "";
        formList.innerHTML = "";
    }
}

const path_2 = "https://pokeapi.co/api/v2/move/";

async function fetchMoves(move_name) {
    const fullPath = path_2 + move_name;
    try{
        const response = await fetch(fullPath);
        if(!response.ok){
            throw new Error("Failed to fetch data!!!");
        }
        const data = await response.json();
        return data;
    }catch(error){
        return error.message;
    }
}
const path_3 = "https://pokeapi.co/api/v2/item/";

async function fetchItem(item_name) {
    const fullPath = path_3 + item_name;
    try{
        const response = await fetch(fullPath);
        if(!response.ok){
            throw new Error("Failed to fetch data!!!");
        }
        const data = await response.json();
        return data;
    }catch(error){
        return error.message;
    }
}

const path_4 = "https://pokeapi.co/api/v2/ability/";

async function fetchAbilities(ability_name) {
    const fullPath = path_4 + ability_name;
    try{
        const response = await fetch(fullPath);
        if(!response.ok){
            throw new Error("Failed to fetch data!!!");
        }
        const data = await response.json();
        return data;
    }catch(error){
        return error.message;
    }
}

const path_5 = "https://pokeapi.co/api/v2/pokemon-species/";

async function fetchSpec(name) {
    const fullPath = path_5 + name;
    try{
        const response = await fetch(fullPath);
        if(!response.ok){
            throw new Error("Failed to fetch data!!!");
        }
        const data = await response.json();
        return data;
    }catch(error){
        return error.message;
    }
}

async function fetchEvo(path) {
    try{
        const response = await fetch(path);
        if(!response.ok){
            throw new Error("Failed to fetch data!!!");
        }
        const data = await response.json();
        return data;
    }catch(error){
        return error.message;
    }
}


const globalTooltip = document.getElementById("globalTooltip");

moveList.addEventListener("mouseover", function(e) {
    if (e.target.classList.contains("move-badge")) {
        const badge = e.target;
        
        const type = badge.getAttribute("data-type");
        const power = badge.getAttribute("data-power");
        const accuracy = badge.getAttribute("data-accuracy");
        const pp = badge.getAttribute("data-pp");
        const priority = badge.getAttribute("data-prio");
        const dmg_class = badge.getAttribute("data-dmg");
        const target = badge.getAttribute("data-target");


        globalTooltip.innerHTML = `
            <strong>Type:</strong> <span style="text-transform: capitalize;">${type}</span><br>
            <strong>Power:</strong> ${power}<br>
            <strong>Accuracy:</strong> ${accuracy}<br>
            <strong>PP:</strong> ${pp}<br>
            <strong>Priority:</strong> ${priority}<br>
            <strong>Dmg_class:</strong> ${dmg_class}<br>
            <strong>Target:</strong> ${target}<br>
        `;

        const rect = badge.getBoundingClientRect();
        
        globalTooltip.style.left = rect.left + (rect.width / 2) - 70 + "px";
        globalTooltip.style.top = rect.top - globalTooltip.offsetHeight - 10 + "px";

        globalTooltip.style.opacity = "1";
        globalTooltip.style.visibility = "visible";
    }
});

moveList.addEventListener("mouseout", function(e) {
    if (e.target.classList.contains("move-badge")) {
        globalTooltip.style.opacity = "0";
        globalTooltip.style.visibility = "hidden";
    }
});



heldItem.addEventListener("mouseover", function(e) {
    if (e.target.classList.contains("item-badge")) {
        const badge = e.target;
        
        const attribute = badge.getAttribute("data-attribute");
        const category = badge.getAttribute("data-category");
        const effect = badge.getAttribute("data-effect");


        globalTooltip.innerHTML = `
            <strong>Category:</strong> <span style="text-transform: capitalize;">${category}</span><br>
            <strong>Attribute:</strong> ${attribute}<br>
            <strong>Effect:</strong> ${effect}
        `;

        const rect = badge.getBoundingClientRect();
        
        globalTooltip.style.left = rect.left + (rect.width / 2) - 70 + "px";
        globalTooltip.style.top = rect.top - globalTooltip.offsetHeight - 10 + "px";

        globalTooltip.style.opacity = "1";
        globalTooltip.style.visibility = "visible";
    }
});

heldItem.addEventListener("mouseout", function(e) {
    if (e.target.classList.contains("item-badge")) {
        globalTooltip.style.opacity = "0";
        globalTooltip.style.visibility = "hidden";
    }
});

abilities_list.addEventListener("mouseover", function(e) {
    if (e.target.classList.contains("ability-badge")) {
        const badge = e.target;
        
        const effect = badge.getAttribute("data-effect");


        globalTooltip.innerHTML = `
            <strong>Effect:</strong> <span style="text-transform: capitalize;">${effect}</span>
        `;

        const rect = badge.getBoundingClientRect();
        
        globalTooltip.style.left = rect.left + (rect.width / 2) - 70 + "px";
        globalTooltip.style.top = rect.top - globalTooltip.offsetHeight - 10 + "px";

        globalTooltip.style.opacity = "1";
        globalTooltip.style.visibility = "visible";
    }
});

abilities_list.addEventListener("mouseout", function(e) {
    if (e.target.classList.contains("ability-badge")) {
        globalTooltip.style.opacity = "0";
        globalTooltip.style.visibility = "hidden";
    }
});


searchBtn.addEventListener('click', function() {
    let name = inputPkm.value.toLowerCase().trim();
    if (name) {
        window.history.pushState({ pkmName: name }, "", `?pokemon=${name}`);
        fetchData();
    }
});


function goToPokemon(name){
    inputPkm.value = name;
    window.history.pushState({pkm_name: name}, "", `?pokemon=${name}`);
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
    fetchData();
}



window.addEventListener("popstate", function(e){
    if(e.state && e.state.pkmName){
        inputPkm.value = e.state.pkmName;
        fetchData();
    }else{
        inputPkm.value = "";
        this.location.reload();
    }
})