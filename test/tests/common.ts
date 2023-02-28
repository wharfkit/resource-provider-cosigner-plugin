import {assert} from 'chai'
import {mockFetch} from '$test/utils/mock-fetch'
import {TransactPluginCosigner} from '../../src/index'

import {PrivateKey, Session, SessionArgs, SessionOptions} from '@wharfkit/session'

import {WalletPluginPrivateKey} from '@wharfkit/wallet-plugin-privatekey'

const wallet = new WalletPluginPrivateKey({
    privateKey: PrivateKey.from('5Jtoxgny5tT7NiNFp1MLogviuPJ9NniWjnU4wKzaX4t7pL4kJ8s'),
})

const mockSessionArgs: SessionArgs = {
    chain: {
        id: '73e4385a2708e6d7048834fbc1079f2fabb17b3c125b146af438971e90716c4d',
        url: 'https://jungle4.greymass.com',
    },
    permissionLevel: 'wharfkit1111@test',
    walletPlugin: wallet,
}

const mockSessionOptions: SessionOptions = {
    fetch: mockFetch,
    transactPlugins: [
        new TransactPluginCosigner({
            actor: 'wharfkitnoop',
            permission: 'cosign',
            privateKey: '5JfFWg1CWsNTeXTWMyfChXXbyD31TCTknSVGwXDSpT6bPxKYLMM',
        }),
    ],
}

suite('cosigner', function () {
    test('prepends action and signs transaction', async function () {
        const session = new Session(mockSessionArgs, mockSessionOptions)
        const action = {
            authorization: [
                {
                    actor: 'wharfkit1111',
                    permission: 'test',
                },
            ],
            account: 'eosio.token',
            name: 'transfer',
            data: {
                from: 'wharfkit1111',
                to: 'wharfkittest',
                quantity: '0.0001 EOS',
                memo: 'wharfkit cosign plugin test',
            },
        }
        const result = await session.transact({
            action,
        })
        assert.equal(result.transaction?.actions.length, 2)
        assert.equal(result.signatures.length, 2)
        assert.equal(
            result.response?.transaction_id,
            'f87fef83dba6ca8c754a5f473ee3234c0a58bee149c20b855ae3cddb5dfd7730'
        )
    })
})
