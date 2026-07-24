const inputPkm = document.querySelector("#inputPkm")
const searchBtn = document.querySelector("#searchBtn")
const pkm_id = document.querySelector(".pkm-id")
const pkm_name = document.querySelector(".pkm-name")
const pkm_types =  document.querySelector(".pkm-types")
const img = document.createElement('img');
const abilities_list = document.querySelector(".abilities-list")
const stats_list = document.querySelector(".stats-list")
const pkm_weight = document.querySelector(".pkm-weight")


async function fetchData() {
    let clean_name = inputPkm.value.toLowerCase();
    if(!clean_name) return;
    pkm_id.textContent = "Đang tải...";
    pkm_name.textContent = "";
    pkm_types.innerHTML = "";
    abilities_list.innerHTML = "";
    stats_list.innerHTML = ""; 
    img.src = "";
    try{
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${clean_name}`)
        if(!response.ok){
            throw new Error("Failed to fetch data!!!");
        }
        const data = await response.json();
        pkm_id.textContent = `ID:#${data.id}`;
        pkm_name.textContent = data.name;
        img.src = data.sprites.front_default;
        img.alt = `Pokemon ${data.name}`;
        pkm_id.after(img);
        pkm_weight.textContent = `Weight:${data.weight}`;
        data.types.forEach(t => {
            pkm_types.innerHTML += `<p class="type-badge ${t.type.name}">${t.type.name}</p>`;
        });
        data.abilities.forEach(a =>{
            abilities_list.innerHTML += `<p class="ability-badge">${a.ability.name}</p>`
        });
        data.stats.forEach(s =>{
            let stat_name = s.stat.name;
            let stat_val = s.base_stat;
            if(stat_name === "special-attack") stat_name = "sp.atk";
            if(stat_name === "special-defense") stat_name = "sp.def";
            let percent = (stat_val/150)*100;
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
    }catch(err){
        pkm_id.textContent = `${err.message}`;
        pkm_name.textContent = "Cannot find pokemon!";
        img.src = "";
        img.alt = "Pokemon none"
        pkm_types.innerHTML = "";
        abilities_list.innerHTML = "";
        stats_list.innerHTML = ""; 
    }
}

searchBtn.addEventListener('click', function(){
    fetchData();
})