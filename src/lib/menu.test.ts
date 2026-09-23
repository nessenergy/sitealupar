/**
 * O menu é o mesmo objeto em três idiomas e mudou por pedido da Alupar em
 * 23/09/2026: Sustentabilidade entra depois de Empresas e Inovação e P&D passa
 * a apontar para o portal próprio. Os dois destinos são subdomínios da Alupar
 * que este repositório não controla — se alguém trocar por caminho interno sem
 * querer, o visitante vai parar numa página que não existe mais no menu.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textos, IDIOMAS } from '../i18n/textos.ts';

test('Sustentabilidade vem logo depois de Empresas, nos três idiomas, e aponta para rs.alupar.com.br', () => {
  for (const idioma of IDIOMAS) {
    const itens = textos[idioma].menu.itens;
    const empresas = itens.findIndex((i) => /empresas|companies/i.test(i.rotulo));
    assert.ok(empresas >= 0, `${idioma}: menu sem Empresas`);
    const seguinte = itens[empresas + 1];
    assert.equal(seguinte?.href, 'https://rs.alupar.com.br/', `${idioma}: Sustentabilidade fora de lugar`);
  }
});

test('Inovação e P&D mantém o rótulo e vai para pdi.alupar.com.br', () => {
  const item = textos['pt-br'].menu.itens.find((i) => i.rotulo === 'Inovação e P&D');
  assert.equal(item?.href, 'https://pdi.alupar.com.br/');
});
