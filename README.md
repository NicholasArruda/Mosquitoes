# Leishmaniose Run

Um mini game web feito com **HTML, CSS e JavaScript puro**, onde você controla um cachorro que precisa pegar ossos, usar repelente e sobreviver aos mosquitos 🦟🔥

---

## Sobre o jogo

No jogo você controla um cachorro que se move horizontalmente na parte inferior da tela.  

Objetos caem do topo:

- 🦴 **Ossos** → +10 pontos  
- 🌿 **Repelente** → +10 pontos + elimina mosquitos próximos  
- 🦟 **Mosquitos** → causam dano  

O repelente elimina mosquitos em um raio de explosão e cada mosquito eliminado concede **+5 pontos**, com animação e efeito visual.

---

## Funcionalidades

- ✅ Movimento com inércia suave  
- ✅ Spawn dinâmico de inimigos  
- ✅ Sistema de colisão otimizado  
- ✅ Remoção automática de objetos após passar do player  
- ✅ Explosão em área com raio configurável  
- ✅ Sistema de pontuação  
- ✅ Sistema de sons:
  - Música de fundo  
  - Som ao pegar osso  
  - Som ao pegar repelente  
  - Som ao matar mosquito  
  - Som de game over  
- ✅ Menu de pause  
- ✅ Botão para ativar/desativar sons  

---

## Mecânicas Técnicas

- Game loop com `requestAnimationFrame`
- Controle manual de arrays com loop reverso para evitar bugs com `splice`
- Sistema de colisão AABB (Axis-Aligned Bounding Box)
- Controle global de áudio via `.muted`
- Sistema de efeitos visuais com classe `Effect`

---

## Estrutura do Projeto

```
📁 assets
   ├── images
   └── sounds

📄 index.html
📄 style.css
📄 game.js
📄 README.md
```

---

## 🎯 Como jogar (link no vercel funcionando: https://leishmaniose-run.vercel.app (fev/26))

(No caso do link ter expirado siga os passos abaixo)

1. Abra o `index.html` no navegador  
2. Mova o cachorro horizontalmente  
3. Pegue ossos  
4. Use repelente estrategicamente  
5. Evite os mosquitos  

---

## ⚙️ Como rodar

Não precisa instalar nada.

Basta abrir o arquivo:

```
index.html
```

No navegador.

---

## 📈 Melhorias futuras

- [ ] Níveis com dificuldade progressiva
- [ ] Power-ups diferentes
- [ ] Ranking de pontuação
- [ ] Versão mobile otimizada (por mais que o site seja pensado primeiramente na metodologia mobile-first)

---

## 👨‍💻 Autor

**Nicholas Almeida**  
Técnico em Programação de Jogos Digitais (2018)
Analista e Desenvolvedor de Sistemas (2025)
Linkedin - https://www.linkedin.com/in/dev-nicholas-arruda/

---

⭐ Se você gostou do projeto, deixe uma estrela!
