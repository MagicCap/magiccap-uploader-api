// Add support for fetch in Node.
let fetch: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
if (typeof window === "undefined") {
    eval('fetch = require("node-fetch")')
} else {
    fetch = window.fetch
}

// Support for the uploaders API V1.
export class UploadersAPIV1 {
    private uploaderSlug!: string
    private clientToken: string | undefined
    private uploaderToken: string | undefined

    constructor(init: any) {
        if (!init || !init._constructedByMe) {
            throw new Error("Do not try and construct this class by yourself. Run UploadersAPIV1.client or UploadersAPIV1.server instead to get this as an object!")
        }
        delete init._constructedByMe
        for (const key of Object.keys(init)) (this as any)[key] = init[key]
        if (this.uploaderSlug === "") throw new Error("Invalid uploader slug.")
    }

    static client(uploaderSlug: string, clientToken: string | undefined) {
        const args = {
            _constructedByMe: true,
            uploaderSlug,
            clientToken,
        }
        return new UploadersAPIV1(args)
    }

    static server(uploaderSlug: string, uploaderToken: string) {
        const args = {
            _constructedByMe: true,
            uploaderSlug,
            uploaderToken,
        }
        return new UploadersAPIV1(args)
    }

    setClientToken(clientToken: string) {
        this.clientToken = clientToken
    }

    private _throwMisconfiguredClient() {
        if (!this.clientToken) throw new Error("This class is configured as a server or does not have a token set. To do client actions, you need to have a class configured as a client and you need to turn your swap token into a client toke. You can then run .setClientToken(<token>) on here or reconstruct the class with the client token.")
    }

    private _throwMisconfiguredServer() {
        if (!this.uploaderToken) throw new Error("This class is configured as a client. To do server actions, you need to have a class configured as a server.")
    }

    async requestSwapToken() {
        const url = `http://127.0.0.1:61222/uploaders_api/v1/auth/swap/${encodeURIComponent(this.uploaderSlug)}`

        let res
        try {
            res = await fetch(url)
        } catch (_) {
            throw new Error("MagicCap is not open.")
        }

        const json = await res.json()
        if (!res.ok) throw new Error(json.message)

        return {
            swapToken: json.swap_token as string,
            expires: json.expires as number,
        }
    }

    async getClientToken(swapToken: string) {
        this._throwMisconfiguredServer()

        const url = `https://api.magiccap.me/swap_tokens/swap/${encodeURIComponent(swapToken)}/${encodeURIComponent(this.uploaderToken!)}/${encodeURIComponent(this.uploaderSlug)}`

        const res = await fetch(url)
        const json = await res.json()
        if (!res.ok) throw new Error(json.message)

        return {
            clientToken: json.client_token as string,
            expires: json.expires as number,
        }
    }

    async checkIfDefault() {
        this._throwMisconfiguredClient()

        const url = "http://127.0.0.1:61222/uploaders_api/v1/uploaders/default_check"

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.clientToken}`,
            },
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message)

        return json.default as boolean
    }

    async showDefaultPrompt() {
        this._throwMisconfiguredClient()

        const url = "http://127.0.0.1:61222/uploaders_api/v1/uploaders/default_prompt"

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.clientToken}`,
            },
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message)
    }

    async revokeClientToken() {
        this._throwMisconfiguredClient()

        const url = "http://127.0.0.1:61222/uploaders_api/v1/auth/revoke"

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.clientToken}`,
            },
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message)

        this.clientToken = undefined
    }

    async setConfigValues(values: {[key: string]: any}) {
        this._throwMisconfiguredClient()

        const urlQuery = []
        for (const key in values) {
            urlQuery.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(values[key]))}`)
        }
        const url = `http://127.0.0.1:61222/uploaders_api/v1/uploaders/set?${urlQuery.join("&")}`

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.clientToken}`,
            },
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.message)
    }
}
