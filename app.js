/* ===================================================== */
/* SISTEMA NUTRICIONAL ILPI - VERSÃO ESTÁVEL COMPLETA    */
/* ===================================================== */

/* ================= UTILITÁRIOS ================= */

function getEl(id){ return document.getElementById(id); }

function getVal(id){
    const el = getEl(id);
    return el ? el.value : "";
}

function getNum(id){
    const el = getEl(id);
    if(!el) return 0;
    return parseFloat((el.value || "").replace(",", ".")) || 0;
}

/* ================= BANCO ================= */

function obterBanco(){
    try{
        return JSON.parse(localStorage.getItem("bancoILPI")) || {};
    }catch{
        return {};
    }
}

function salvarBanco(banco){
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

/* ================= PACIENTE ================= */

function definirPacienteAtivo(nome){
    localStorage.setItem("pacienteAtivoILPI", nome);
}

function obterPacienteAtivo(){
    return localStorage.getItem("pacienteAtivoILPI");
}

function criarPacienteSeNaoExistir(nome){

    const banco = obterBanco();

    if(!banco[nome]){
        banco[nome] = {
            dadosBasicos:{},
            avaliacoes:[],
            comorbidades:[]
        };
        salvarBanco(banco);
    }

}

/* ================= NAVBAR ================= */

function atualizarPacienteAtivoNavbar(){

    const nome = obterPacienteAtivo();
    const info = getEl("pacienteAtivoInfo");

    if(!info) return;

    info.innerText = nome
        ? `👤 ${nome}`
        : "👤 Nenhum paciente selecionado";

}

function atualizarIndicadorICN(){

    const indicador = getEl("indicadorRisco");
    if(!indicador) return;

    const icn = getNum("icn");

    indicador.innerText = icn ? `ICN: ${icn}` : "ICN: —";

}

/* ================= SALVAR REGISTRO ================= */

function salvarRegistro(){

    let nome = getVal("nome").trim().toUpperCase();

    if(!nome){
        const ativo = obterPacienteAtivo();
        if(ativo){
            nome = ativo;
        }else{
            alert("Digite o nome do residente.");
            return;
        }
    }

    criarPacienteSeNaoExistir(nome);

    const banco = obterBanco();

    banco[nome].dadosBasicos = {

        dataNascimento:getVal("dataNascimento"),
        idade:getVal("idade"),
        dataAdmissao:getVal("dataAdmissao"),
        alergias:getVal("alergias"),
        convenio:getVal("convenio"),
        hygia:getVal("hygia"),
        diagnosticos:getVal("diagnosticos"),
        protese:getVal("protese")

    };

    salvarBanco(banco);

    definirPacienteAtivo(nome);
    atualizarPacienteAtivoNavbar();

    alert("Registro salvo.");

}

/* ================= IDADE ================= */

function calcularIdade(){

    const nasc = getVal("dataNascimento");
    if(!nasc) return;

    const hoje = new Date();
    const nascimento = new Date(nasc);

    let idade = hoje.getFullYear() - nascimento.getFullYear();

    const mes = hoje.getMonth() - nascimento.getMonth();

    if(mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate()))
        idade--;

    if(getEl("idade"))
        getEl("idade").value = idade;

}

/* ================= IMC ================= */

function calcularIMC(){

    const peso = getNum("peso");
    const altura = getNum("altura");
    const idade = getNum("idade");

    if(peso<=0 || altura<=0) return;

    const imc = peso/(altura*altura);

    if(getEl("imc"))
        getEl("imc").value = imc.toFixed(2);

    let classe="";

    if(idade>=60){

        if(imc<22) classe="Baixo Peso";
        else if(imc<=27) classe="Eutrofia";
        else classe="Excesso de Peso";

    }else{

        if(imc<18.5) classe="Baixo Peso";
        else if(imc<25) classe="Eutrofia";
        else classe="Sobrepeso";

    }

    if(getEl("classImc"))
        getEl("classImc").value = classe;

}

/* ================= MNA ================= */

function calcularMNA(){

    let total=0;

    const campos=[
        "mnaA","mnaB","mnaC","mnaD","mnaE",
        "mnaG","mnaH","mnaI","mnaJ","mnaK",
        "mnaL","mnaM","mnaN","mnaO","mnaP",
        "mnaQ","mnaR"
    ];

    campos.forEach(id=>{
        total+=parseFloat(getVal(id))||0;
    });

    if(getEl("mnaTotal"))
        getEl("mnaTotal").value=total.toFixed(1);

    let classe=
        total<17
        ?"Desnutrição"
        :total<24
        ?"Risco de Desnutrição"
        :"Estado Nutricional Normal";

    if(getEl("classMNA"))
        getEl("classMNA").value=classe;

}

/* ================= NRS ================= */

function calcularNRS(){

    const nutri=getNum("nrsNutri");
    const grav=getNum("nrsGrav");
    const idadeBonus=getNum("idade")>=70?1:0;

    const total=nutri+grav+idadeBonus;

    if(getEl("nrsTotal"))
        getEl("nrsTotal").value=total;

    if(getEl("classNRS"))
        getEl("classNRS").value=
            total>=3?"Risco Nutricional":"Sem Risco";

}

/* ================= SARCOPENIA ================= */

function calcularSarcopenia(){

    const braco=getNum("circBraco");
    const pant=getNum("circPanturrilha");

    let res="Sem risco";

    if((braco>0 && braco<22)||(pant>0 && pant<31))
        res="Risco Sarcopênico";

    if(getEl("scoreSarcopenia"))
        getEl("scoreSarcopenia").value=res;

}

/* ================= ICN ================= */

function calcularICN(){

    let score=0;

    const mna=getNum("mnaTotal");

    if(mna<17) score+=3;
    else if(mna<24) score+=2;

    if(getNum("nrsTotal")>=3)
        score+=2;

    if((getVal("scoreSarcopenia")||"").includes("Risco"))
        score+=1;

    if(getEl("icn"))
        getEl("icn").value=score;

    let classe=
        score>=4
        ?"Alto Risco"
        :score>=2
        ?"Risco Moderado"
        :"Baixo Risco";

    if(getEl("classICN"))
        getEl("classICN").value=classe;

    atualizarIndicadorICN();

}

/* ================= SALVAR AVALIAÇÃO ================= */

function salvarMNA(){

    const nome = obterPacienteAtivo();

    if(!nome){
        alert("Selecione um residente primeiro.");
        return;
    }

    const banco = obterBanco();

    if(!banco[nome])
        banco[nome]={avaliacoes:[]};

    const registro={

        data:new Date().toISOString(),

        peso:getNum("peso"),
        imc:getNum("imc"),
        classImc:getVal("classImc"),

        mna:getNum("mnaTotal"),
        classMNA:getVal("classMNA"),

        icn:getNum("icn"),
        classICN:getVal("classICN")

    };

    if(!banco[nome].avaliacoes)
        banco[nome].avaliacoes=[];

    banco[nome].avaliacoes.push(registro);

    salvarBanco(banco);

    alert("Avaliação salva com sucesso.");

}

/* ================= ALERTAS ================= */

function atualizarPainelAlertas(){

    const painel=getEl("painelAlertas");
    if(!painel) return;

    let alertas=[];

    const imc=getNum("imc");

    if(getNum("idade")>=60 && imc>0 && imc<22)
        alertas.push("⚠ IMC baixo");

    if(getVal("classICN")==="Alto Risco")
        alertas.push("🚨 ICN Alto Risco");

    if(getNum("nrsTotal")>=3)
        alertas.push("⚠ NRS ≥ 3");

    painel.innerHTML=
        alertas.length
        ?alertas.map(a=>`<div>${a}</div>`).join("")
        :"✔ Sem alertas";

}

/* ================= LOAD ================= */

document.addEventListener("DOMContentLoaded",function(){

    atualizarPacienteAtivoNavbar();

    calcularIdade();
    calcularIMC();
    calcularSarcopenia();
    calcularNRS();
    calcularMNA();
    calcularICN();

    document.querySelectorAll("input,select").forEach(el=>{

        el.addEventListener("input",()=>{

            calcularIdade();
            calcularIMC();
            calcularSarcopenia();
            calcularNRS();
            calcularMNA();
            calcularICN();
            atualizarPainelAlertas();

        });

    });

});
