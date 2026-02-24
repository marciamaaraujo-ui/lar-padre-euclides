/* ===================================================== */
/* SISTEMA NUTRICIONAL ILPI */
/* ===================================================== */

/* ================= UTILITÁRIOS ================= */

function getEl(id){
    return document.getElementById(id);
}

function getVal(id){
    const el = getEl(id);
    return el ? el.value : "";
}

function getNum(id){
    const el = getEl(id);
    if(!el) return 0;
    return parseFloat((el.value || "").replace(",", ".")) || 0;
}

/* ================= MNA ================= */

function calcularMNA(){

    let total = 0;

    const campos = [
        "mnaA","mnaB","mnaC","mnaD","mnaE",
        "mnaG","mnaH","mnaI","mnaJ","mnaK",
        "mnaL","mnaM","mnaN","mnaO","mnaP",
        "mnaQ","mnaR"
    ];

    campos.forEach(id => {
        const valor = parseFloat(getVal(id));
        if(!isNaN(valor)){
            total += valor;
        }
    });

    const campoTotal = getEl("mnaTotal");
    if(campoTotal){
        campoTotal.value = total.toFixed(1);
    }

    const campoClass = getEl("classMNA");
    if(campoClass){
        let classificacao = "Estado Nutricional Normal";

        if(total < 17) classificacao = "Desnutrido";
        else if(total < 24) classificacao = "Risco de Desnutrição";

        campoClass.value = classificacao;
    }
}

/* ================= LOAD ================= */

document.addEventListener("DOMContentLoaded", function(){

    const selects = document.querySelectorAll("[id^='mna']");

    selects.forEach(select => {
        select.addEventListener("change", calcularMNA);
    });

});
