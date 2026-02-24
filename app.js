/* ===================================================== */
/* SISTEMA NUTRICIONAL ILPI – VERSÃO PROFISSIONAL FINAL */
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

/* ================= IDADE ================= */

function calcularIdade(){
    const dataNascimento = getVal("dataNascimento");
    if(!dataNascimento) return 0;

    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if(mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())){
        idade--;
    }

    if(getEl("idade")) getEl("idade").value = idade;
    return idade;
}

/* ================= ANTROPOMETRIA ================= */

function calcularAntropometria(){

    const peso = getNum("peso");
    const altura = getNum("altura");
    const pesoHab = getNum("pesoHab");

    let imc = 0;

    if(peso > 0 && altura > 0){
        imc = peso / (altura * altura);

        if(getEl("imc")) getEl("imc").value = imc.toFixed(2);

        let classIMC = "Sobrepeso";
        if(imc < 22) classIMC = "Baixo Peso";
        else if(imc <= 27) classIMC = "Eutrofia";

        if(getEl("classImc")) getEl("classImc").value = classIMC;
    }

    if(peso > 0 && pesoHab > 0 && getEl("perda")){
        const perda = ((pesoHab - peso) / pesoHab) * 100;
        getEl("perda").value = perda.toFixed(1) + "%";
    }

    return imc;
}

/* ================= CIRCUNFERÊNCIAS ================= */

function calcularCircunferencias(imc, idade){

    if(idade < 65) return;

    const sexo = getVal("sexo");
    const braco = getNum("circBraco");
    const pant = getNum("circPanturrilha");

    if(!sexo) return;

    /* ===== MUAC ===== */

    let cutoffBaixo = 0;
    let cutoffMuitoBaixo = 0;

    if(sexo === "F"){
        cutoffBaixo = 25;
        cutoffMuitoBaixo = 23;
        if(imc >=25 && imc <30){ cutoffBaixo -=2; cutoffMuitoBaixo -=2; }
        else if(imc >=30 && imc <40){ cutoffBaixo -=6; cutoffMuitoBaixo -=6; }
        else if(imc >=40){ cutoffBaixo -=9; cutoffMuitoBaixo -=9; }
    }

    if(sexo === "M"){
        cutoffBaixo = 28;
        cutoffMuitoBaixo = 26;
        if(imc >=25 && imc <30){ cutoffBaixo -=3; cutoffMuitoBaixo -=3; }
        else if(imc >=30 && imc <40){ cutoffBaixo -=7; cutoffMuitoBaixo -=7; }
        else if(imc >=40){ cutoffBaixo -=10; cutoffMuitoBaixo -=10; }
    }

    const campoBraco = getEl("adequacaoBraco");

    if(braco > 0 && campoBraco){
        if(braco < cutoffMuitoBaixo)
            campoBraco.value = "Muito Baixo (Alto risco)";
        else if(braco < cutoffBaixo)
            campoBraco.value = "Baixo (Risco)";
        else
            campoBraco.value = "Adequado";
    }

    /* ===== PANTURRILHA ===== */

    let cutoffPant = (sexo === "F") ? 33 : 34;

    if(imc >=25 && imc <30) cutoffPant -=3;
    else if(imc >=30 && imc <40) cutoffPant -=7;
    else if(imc >=40) cutoffPant -=12;

    const campoPant = getEl("adequacaoPanturrilha");

    if(pant > 0 && campoPant){
        if(pant < cutoffPant)
            campoPant.value = "Baixa (Risco Sarcopenia)";
        else
            campoPant.value = "Adequada";
    }
}

/* ================= SCORE SARCOPENIA ================= */

function calcularScoreSarcopenia(){

    const muac = getVal("adequacaoBraco");
    const cp = getVal("adequacaoPanturrilha");

    let score = 0;

    if(muac.includes("Muito Baixo")) score += 2;
    else if(muac.includes("Baixo")) score += 1;

    if(cp.includes("Baixa")) score += 2;

    let classificacao = "Sem risco";
    if(score >= 3) classificacao = "Alto Risco Sarcopênico";
    else if(score >= 1) classificacao = "Risco Sarcopênico Leve";

    if(getEl("scoreSarcopenia"))
        getEl("scoreSarcopenia").value = classificacao;

    return score;
}

/* ================= MNA ================= */

function calcularMNA(imc){

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

    /* ================= IMC (Item F) ================= */

    let scoreIMC = 0;

    if(typeof imc === "number" && imc > 0){
        if(imc < 19) scoreIMC = 0;
        else if(imc < 21) scoreIMC = 1;
        else if(imc < 23) scoreIMC = 2;
        else scoreIMC = 3;
    }

    if(getEl("mnaF")){
        getEl("mnaF").value = scoreIMC;
    }

    total += scoreIMC;

    /* ================= TOTAL ================= */

    if(getEl("mnaTotal")){
        getEl("mnaTotal").value = total.toFixed(1);
    }

    /* ================= CLASSIFICAÇÃO ================= */

    if(getEl("classMNA")){

        let classif = "";

        if(total < 17){
            classif = "Desnutrido";
        }
        else if(total < 24){
            classif = "Risco de Desnutrição";
        }
        else{
            classif = "Estado Nutricional Normal";
        }

        getEl("classMNA").value = classif;
    }

    return total;
}
/* ================= NRS ================= */

function calcularNRS(imc, idade){

    let total = getNum("nrsNutri") + getNum("nrsGrav");

    const campoIdade = getEl("nrsIdade");

    if(campoIdade){
        if(idade >= 70){
            total += 1;
            campoIdade.value = "+1";
        } else {
            campoIdade.value = "0";
        }
    }

    if(getEl("nrsTotal")) getEl("nrsTotal").value = total;

    return total;
}

/* ================= ICN ================= */

function calcularICN(mna, nrs, imc){

    const mnaNormalizado = mna > 0 ? (30 - mna) / 3 : 0;

    let imcScore = 0;
    if(imc < 22) imcScore = 2;
    else if(imc > 30) imcScore = 1;

    const sarcScore = calcularScoreSarcopenia() * 1.2;

    const icnFinal = mnaNormalizado + nrs + imcScore + sarcScore;

    let classificacao = "Baixo Risco";
    if(icnFinal >= 15)
        classificacao = "Alto Risco Clínico";
    else if(icnFinal >= 8)
        classificacao = "Risco Moderado";

    if(getEl("icn")) getEl("icn").value = icnFinal.toFixed(2);
    if(getEl("classICN")) getEl("classICN").value = classificacao;

    atualizarIndicadorNavbar(classificacao);

    return classificacao;
}

/* ================= NAVBAR ================= */

function atualizarIndicadorNavbar(classificacao){

    const indicador = getEl("indicadorRisco");
    if(!indicador) return;

    indicador.className = "indicador-risco";

    if(classificacao === "Alto Risco Clínico"){
        indicador.classList.add("alto");
        indicador.innerText = "ICN: Alto";
    }
    else if(classificacao === "Risco Moderado"){
        indicador.classList.add("moderado");
        indicador.innerText = "ICN: Moderado";
    }
    else{
        indicador.classList.add("baixo");
        indicador.innerText = "ICN: Baixo";
    }
}

/* ================= ENGINE ================= */

function calcularTudo(){
    const idade = calcularIdade();
    const imc = calcularAntropometria();
    calcularCircunferencias(imc, idade);
    const mna = calcularMNA(imc);
    const nrs = calcularNRS(imc, idade);
    const classificacao = calcularICN(mna, nrs, imc);
    gerarPES(classificacao);
}

/* ================= PES ================= */

function gerarPES(classificacao){
    if(!getEl("parecer")) return;

    let texto = "Estado nutricional preservado.";

    if(classificacao === "Alto Risco Clínico")
        texto = "Desnutrição relacionada à ingestão insuficiente evidenciada por risco clínico elevado.";
    else if(classificacao === "Risco Moderado")
        texto = "Risco nutricional relacionado à condição clínica atual.";

    getEl("parecer").value = texto;
}

/* ================= BANCO LOCAL ================= */

function obterBanco(){
    return JSON.parse(localStorage.getItem("bancoILPI")) || {};
}

function salvarBanco(banco){
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

function salvarRegistro(){

    const nome = getVal("nome").trim().toUpperCase();
    if(!nome){
        alert("Nome obrigatório.");
        return;
    }

    const banco = obterBanco();

    if(!banco[nome]){
        banco[nome] = {
            criadoEm: new Date().toISOString(),
            avaliacoes: []
        };
    }

    const novaAvaliacao = {
        data: new Date().toISOString(),
        idade: getVal("idade"),
        peso: getVal("peso"),
        altura: getVal("altura"),
        imc: getVal("imc"),
        mna: getVal("mnaTotal"),
        nrs: getVal("nrsTotal"),
        icn: getVal("icn"),
        classificacao: getVal("classICN"),
        katz: getVal("katzTotal"),
        parecer: getVal("parecer")
    };

    banco[nome].avaliacoes.push(novaAvaliacao);

    salvarBanco(banco);
    localStorage.setItem("pacienteAtivoILPI", nome);

    atualizarPacienteAtivoNavbar();

    alert("Avaliação salva com sucesso.");
}

/* ================= PACIENTE ATIVO ================= */

function atualizarPacienteAtivoNavbar(){

    const nome = localStorage.getItem("pacienteAtivoILPI");
    const banco = obterBanco();
    const info = getEl("pacienteAtivoInfo");

    if(!info) return;

    if(!nome || !banco[nome]){
        info.innerText = "👤 Nenhum paciente selecionado";
        return;
    }

    const ultima = banco[nome].avaliacoes.slice(-1)[0];
    info.innerText = `👤 ${nome} – ${ultima.idade} anos`;
}

/* ================= FOTO ================= */

function carregarFoto(event){

    const file = event.target.files[0];
    if(!file) return;

    if(!file.type.startsWith("image/")){
        alert("Selecione apenas arquivos de imagem.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e){

        const img = new Image();
        img.src = e.target.result;

        img.onload = function(){

            const canvas = document.createElement("canvas");
            const maxSize = 400;

            let width = img.width;
            let height = img.height;

            if(width > height){
                if(width > maxSize){
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if(height > maxSize){
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

            salvarFotoNoPaciente(compressedBase64);

            const preview = getEl("fotoPreview");
            preview.src = compressedBase64;
            preview.style.display = "block";
        };

    };

    reader.readAsDataURL(file);
}
function salvarFotoNoPaciente(base64){

    const nome = getVal("nome").trim().toUpperCase();

    if(!nome){
        alert("Digite o nome e salve o paciente antes de adicionar foto.");
        return;
    }

    const banco = obterBanco();

    if(!banco[nome]){
        banco[nome] = {
            criadoEm: new Date().toISOString(),
            avaliacoes: []
        };
    }

    banco[nome].foto = base64;

    salvarBanco(banco);
}
/* ================= KATZ ================= */

function calcularKatz(){

    const campos = [
        "katzBanho","katzVestir","katzHigiene",
        "katzTransferencia","katzContinencia","katzAlimentacao"
    ];

    let total = 0;

    campos.forEach(id=>{
        const el = getEl(id);
        if(el) total += parseInt(el.value) || 0;
    });

    if(getEl("katzTotal")) getEl("katzTotal").value = total;

    let classificacao = "";

    if(total === 6)
        classificacao = "Independente nas AVDs";
    else if(total >= 3)
        classificacao = "Dependência Parcial";
    else
        classificacao = "Dependência Importante";

    if(getEl("katzClassificacao"))
        getEl("katzClassificacao").value = classificacao;
}

/* ================= LOAD ================= */

document.addEventListener("DOMContentLoaded", function(){

    atualizarPacienteAtivoNavbar();

    const nome = localStorage.getItem("pacienteAtivoILPI");
    const banco = obterBanco();
    const preview = getEl("fotoPreview");

    if(nome && banco[nome] && banco[nome].foto && preview){
        preview.src = banco[nome].foto;
        preview.style.display = "block";
    }

    const fotoUpload = getEl("fotoUpload");
    if(fotoUpload){
        fotoUpload.addEventListener("change", carregarFoto);
    }

});
