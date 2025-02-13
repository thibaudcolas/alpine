import { haveLength, haveText, haveValue, haveHtml, html, test } from '../../utils'

test('can morph components and preserve Alpine state',
    [html`
        <div x-data="{ foo: 'bar' }">
            <button @click="foo = 'baz'">Change Foo</button>
            <span x-text="foo"></span>
        </div>
    `],
    ({ get }, reload, window, document) => {
        let toHtml = document.querySelector('div').outerHTML

        get('span').should(haveText('bar'))
        get('button').click()
        get('span').should(haveText('baz'))

        get('div').then(([el]) => window.Alpine.morph(el, toHtml))

        get('span').should(haveText('baz'))
    },
)

test('morphing target uses outer Alpine scope',
    [html`
        <article x-data="{ foo: 'bar' }">
            <div>
                <button @click="foo = 'baz'">Change Foo</button>
                <span x-text="foo"></span>
            </div>
        </article>
    `],
    ({ get }, reload, window, document) => {
        let toHtml = document.querySelector('div').outerHTML

        get('span').should(haveText('bar'))
        get('button').click()
        get('span').should(haveText('baz'))

        get('div').then(([el]) => window.Alpine.morph(el, toHtml))

        get('span').should(haveText('baz'))
    },
)

test('can morph with HTML change and preserve Alpine state',
    [html`
        <div x-data="{ foo: 'bar' }">
            <button @click="foo = 'baz'">Change Foo</button>
            <span x-text="foo"></span>
        </div>
    `],
    ({ get }, reload, window, document) => {
        let toHtml = document.querySelector('div').outerHTML.replace('Change Foo', 'Changed Foo')

        get('span').should(haveText('bar'))
        get('button').click()
        get('span').should(haveText('baz'))
        get('button').should(haveText('Change Foo'))

        get('div').then(([el]) => window.Alpine.morph(el, toHtml))

        get('span').should(haveText('baz'))
        get('button').should(haveText('Changed Foo'))
    },
)

test('morphing an element with multiple nested Alpine components preserves scope',
    [html`
        <div x-data="{ foo: 'bar' }">
            <button @click="foo = 'baz'">Change Foo</button>
            <span x-text="foo"></span>

            <div x-data="{ bob: 'lob' }">
                <a href="#" @click.prevent="bob = 'law'">Change Bob</a>
                <h1 x-text="bob"></h1>
            </div>
        </div>
    `],
    ({ get }, reload, window, document) => {
        let toHtml = document.querySelector('div').outerHTML

        get('span').should(haveText('bar'))
        get('h1').should(haveText('lob'))
        get('button').click()
        get('a').click()
        get('span').should(haveText('baz'))
        get('h1').should(haveText('law'))

        get('div').then(([el]) => window.Alpine.morph(el, toHtml))

        get('span').should(haveText('baz'))
        get('h1').should(haveText('law'))
    },
)

test('can morph teleports',
    [html`
        <div x-data="{ count: 1 }" id="a">
            <button @click="count++">Inc</button>

            <template x-teleport="#b">
                <div>
                    <h1 x-text="count"></h1>
                    <h2>hey</h2>
                </div>
            </template>
        </div>

        <div id="b"></div>
    `],
    ({ get }, reload, window, document) => {
        let toHtml = html`
        <div x-data="{ count: 1 }" id="a">
            <button @click="count++">Inc</button>

            <template x-teleport="#b">
                <div>
                    <h1 x-text="count"></h1>
                    <h2>there</h2>
                </div>
            </template>
        </div>
        `
        get('h1').should(haveText('1'))
        get('h2').should(haveText('hey'))
        get('button').click()
        get('h1').should(haveText('2'))
        get('h2').should(haveText('hey'))

        get('div#a').then(([el]) => window.Alpine.morph(el, toHtml))

        get('h1').should(haveText('2'))
        get('h2').should(haveText('there'))
    },
)

test('can morph',
    [html`
        <ul>
            <li>foo<input></li>
        </ul>
    `],
    ({ get }, reload, window, document) => {
        let toHtml = html`
            <ul>
                <li>bar<input></li>
                <li>foo<input></li>
            </ul>
        `

        get('input').type('foo')

        get('ul').then(([el]) => window.Alpine.morph(el, toHtml))

        get('li').should(haveLength(2))
        get('li:nth-of-type(1)').should(haveText('bar'))
        get('li:nth-of-type(2)').should(haveText('foo'))
        get('li:nth-of-type(1) input').should(haveValue('foo'))
        get('li:nth-of-type(2) input').should(haveValue(''))
    },
)

test('can morph using lookahead',
    [html`
        <ul>
            <li>foo<input></li>
        </ul>
    `],
    ({ get }, reload, window, document) => {
        let toHtml = html`
            <ul>
                <li>bar<input></li>
                <li>baz<input></li>
                <li>foo<input></li>
            </ul>
        `

        get('input').type('foo')

        get('ul').then(([el]) => window.Alpine.morph(el, toHtml, {lookahead: true}))

        get('li').should(haveLength(3))
        get('li:nth-of-type(1)').should(haveText('bar'))
        get('li:nth-of-type(2)').should(haveText('baz'))
        get('li:nth-of-type(3)').should(haveText('foo'))
        get('li:nth-of-type(1) input').should(haveValue(''))
        get('li:nth-of-type(2) input').should(haveValue(''))
        get('li:nth-of-type(3) input').should(haveValue('foo'))
    },
)

test('can morph using keys',
    [html`
        <ul>
            <li key="1">foo<input></li>
        </ul>
    `],
    ({ get }, reload, window, document) => {
        let toHtml = html`
            <ul>
                <li key="2">bar<input></li>
                <li key="3">baz<input></li>
                <li key="1">foo<input></li>
            </ul>
        `

        get('input').type('foo')

        get('ul').then(([el]) => window.Alpine.morph(el, toHtml))

        get('li').should(haveLength(3))
        get('li:nth-of-type(1)').should(haveText('bar'))
        get('li:nth-of-type(2)').should(haveText('baz'))
        get('li:nth-of-type(3)').should(haveText('foo'))
        get('li:nth-of-type(1) input').should(haveValue(''))
        get('li:nth-of-type(2) input').should(haveValue(''))
        get('li:nth-of-type(3) input').should(haveValue('foo'))
    },
)

test('can morph using a custom key function',
    [html`
        <ul>
            <li data-key="1">foo<input></li>
        </ul>
    `],
    ({ get }, reload, window, document) => {
        let toHtml = html`
            <ul>
                <li data-key="2">bar<input></li>
                <li data-key="3">baz<input></li>
                <li data-key="1">foo<input></li>
            </ul>
        `

        get('input').type('foo')

        get('ul').then(([el]) => window.Alpine.morph(el, toHtml, {key(el) {return el.dataset.key}}))

        get('li').should(haveLength(3))
        get('li:nth-of-type(1)').should(haveText('bar'))
        get('li:nth-of-type(2)').should(haveText('baz'))
        get('li:nth-of-type(3)').should(haveText('foo'))
        get('li:nth-of-type(1) input').should(haveValue(''))
        get('li:nth-of-type(2) input').should(haveValue(''))
        get('li:nth-of-type(3) input').should(haveValue('foo'))
    },
)

test('can morph text nodes',
    [html`<h2>Foo <br> Bar</h2>`],
    ({ get }, reload, window, document) => {
        let toHtml = html`<h2>Foo <br> Baz</h2>`
        get('h2').then(([el]) => window.Alpine.morph(el, toHtml))
        get('h2').should(haveHtml('Foo <br> Baz'))
    },
)
