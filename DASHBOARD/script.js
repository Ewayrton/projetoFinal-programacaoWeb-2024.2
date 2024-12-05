let produtoEditandoId = null;

let chart4 = null; // Variável global para armazenar a instância do gráfico de quantidade
let chart5 = null; // Variável global para armazenar a instância do gráfico de lucro

function criarGrafico(labels, data_chart, data_lucro_percentual) {
    const ctx4 = document.getElementById("chart1").getContext("2d");
    const ctx5 = document.getElementById("chart2").getContext("2d");

    // Destroi os gráficos existentes, se houver
    if (chart4) {
        chart4.destroy();
    }
    if (chart5) {
        chart5.destroy();
    }

    // Criação do gráfico de quantidade de produtos
    chart4 = new Chart(ctx4, {
        type: "pie", // Tipo de gráfico
        data: {
            labels: labels, // Labels do gráfico
            datasets: [{
                label: "Quantidade de Produtos",
                data: data_chart, // Dados do gráfico de quantidade
                backgroundColor: ["#5056BF", "#65A6FA", "#6D74F2", "#9B57CC", "#00CADC"], // Cores do gráfico
                borderColor: "#FFFFFF", // Cor da borda
                borderWidth: 2 // Largura da borda
            }]
        }
    });

    // Criação do gráfico de lucro (percentual)
    chart5 = new Chart(ctx5, {
        type: "pie", // Tipo de gráfico
        data: {
            labels: labels, // Labels do gráfico
            datasets: [{
                label: "Lucro Percentual dos Produtos",
                data: data_lucro_percentual, // Dados do gráfico de lucro percentual
                backgroundColor: ["#FF8C42", "#FF6347", "#FFD700", "#FF1493", "#32CD32"], // Cores do gráfico de lucro
                borderColor: "#FFFFFF", // Cor da borda
                borderWidth: 2 // Largura da borda
            }]
        }
    });
}
//funcao para listar produtos
function listarProdutos() {
    fetch('https://parseapi.back4app.com/parse/classes/Produto', {
        method: 'GET',
        headers: {
            'X-Parse-Application-Id': 'IlO78lK8DrU6wOjy5KTVz3giRDowJ0aO64LZzq9F',
            'X-Parse-REST-API-Key': 'SGZSkF26vT0scc5ciiklDYOrR9ZVUkcAKzBpbiUF',
        }
    })
    .then(response => response.json())
    .then(data => {
        const produtos = data.results || [];
        const tableBody = document.querySelector('#produtosTable tbody');
        const labels = [];
        const data_chart = [];
        const data_lucro_percentual = [];

        // Limpa a tabela antes de preenchê-la
        tableBody.innerHTML = '';

        // Adiciona produtos à tabela e prepara os dados para os gráficos
        produtos.forEach(produto => {
            labels.push(produto.nome);
            data_chart.push(produto.quantidade);

            // Calculando o lucro percentual
            const lucro = produto.precoVenda - produto.preco;
            const lucroPercentual = (lucro / produto.precoVenda) * 100;
            data_lucro_percentual.push(lucroPercentual);

            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${produto.nome}</td>
        <td>${produto.preco}</td>
        <td>${produto.quantidade}</td>
        <td>${produto.precoVenda || ''}</td>
        <td>
        <button class="btn-editar" onclick="editarProduto('${produto.objectId}', '${produto.nome}', ${produto.preco}, ${produto.quantidade}, ${produto.precoVenda})">Editar</button>
        <button class="btn-excluir" onclick="excluirProduto('${produto.objectId}')">Excluir</button>
        </td>
`;

            tableBody.appendChild(row);
        });

        // Atualiza os gráficos
        criarGrafico(labels, data_chart, data_lucro_percentual);
    })
    .catch(error => {
        console.error('Erro ao buscar produtos:', error);
        alert('Erro ao buscar produtos.');
        console.log('Erro ao buscar produtos.',error);
    });
}

// Função para adicionar novos produtos
document.getElementById('dadosForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value;
    const preco = Number(document.getElementById('preco').value);
    const qtd = Number(document.getElementById('qtd').value);
    const precoVenda = Number(document.getElementById('precoVenda').value);

    fetch('https://parseapi.back4app.com/parse/classes/Produto', {
        method: 'POST',
        headers: {
            'X-Parse-Application-Id': 'IlO78lK8DrU6wOjy5KTVz3giRDowJ0aO64LZzq9F',
            'X-Parse-REST-API-Key': 'SGZSkF26vT0scc5ciiklDYOrR9ZVUkcAKzBpbiUF',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, preco, quantidade: qtd, precoVenda })
    })
    .then(() => {
        alert('Produto adicionado com sucesso!');
        listarProdutos();
    })
    .catch(error => {
        console.error('Erro ao adicionar produto:', error);
        alert('Erro ao adicionar produto.');
    });
});

// Função para abrir o formulário de edição - by MK
function editarProduto(id, nome, preco, quantidade, precoVenda) {
    produtoEditandoId = id;
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('editNome').value = nome;
    document.getElementById('editPreco').value = preco;
    document.getElementById('editQuantidade').value = quantidade;
    document.getElementById('editPrecoVenda').value = precoVenda;
}

// Função para salvar a edição
document.getElementById('salvarEdicao').addEventListener('click', function() {
    const novoNome = document.getElementById('editNome').value;
    const novoPreco = Number(document.getElementById('editPreco').value);
    const novaQuantidade = Number(document.getElementById('editQuantidade').value);
    const novoPrecoVenda = Number(document.getElementById('editPrecoVenda').value);
console.log(novoPrecoVenda)
    fetch(`https://parseapi.back4app.com/parse/classes/Produto/${produtoEditandoId}`, {
        method: 'PUT',
        headers: {
            'X-Parse-Application-Id': 'IlO78lK8DrU6wOjy5KTVz3giRDowJ0aO64LZzq9F',
            'X-Parse-REST-API-Key': 'SGZSkF26vT0scc5ciiklDYOrR9ZVUkcAKzBpbiUF',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome: novoNome, preco: novoPreco, quantidade: novaQuantidade, precoVenda: novoPrecoVenda })
    })
    .then(() => {
        alert('Produto atualizado com sucesso!');
        document.getElementById('editForm').style.display = 'none';
        listarProdutos();
    })
    .catch(error => {
        console.error('Erro ao atualizar produto:', error);
        alert('Erro ao atualizar produto.');
    });
});


// Função para excluir produtos
function excluirProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        fetch(`https://parseapi.back4app.com/parse/classes/Produto/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Parse-Application-Id': 'IlO78lK8DrU6wOjy5KTVz3giRDowJ0aO64LZzq9F',
                'X-Parse-REST-API-Key': 'SGZSkF26vT0scc5ciiklDYOrR9ZVUkcAKzBpbiUF',
            }
        })
        .then(() => {
            alert('Produto excluído com sucesso!');
            listarProdutos();
        })
        .catch(error => {
            console.error('Erro ao excluir produto:', error);
            alert('Erro ao excluir produto.');
        });
    }
}

// Carregar os produtos ao inicializar a página
document.addEventListener('DOMContentLoaded', listarProdutos);

async function converter() {
    try {
        // Fetch da API para obter o câmbio BRL-USD
        let resposta = await fetch('https://economia.awesomeapi.com.br/json/last/BRL-USD', {
            method: 'GET',
        });
        let dados = await resposta.json();
        let taxaCambio = parseFloat(dados.BRLUSD.high); // Pega o valor do câmbio atual

        // Atualiza os preços na tabela
        const tableRows = document.querySelectorAll('#produtosTable tbody tr');
        tableRows.forEach(row => {
            // Pega o valor em BRL do preço de venda
            let precoVendaBRL = parseFloat(row.children[3].innerText);

            // Converte corretamente de BRL para USD
            let precoVendaUSD = (precoVendaBRL * taxaCambio).toFixed(2);

            // Adiciona ou atualiza a célula do preço em USD
            if (row.children.length === 5) {
                const precoUSDCell = document.createElement('td');
                precoUSDCell.innerText = `$ ${precoVendaUSD}`;
                row.appendChild(precoUSDCell);
            } else {
                row.children[4].innerText = `$ ${precoVendaUSD}`;
            }
        });

        alert('Conversão concluída com sucesso!');
    } catch (error) {
        console.error('Erro ao converter valores:', error);
        alert('Erro ao realizar a conversão.');
    }
}