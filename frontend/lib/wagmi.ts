import { http, createConfig } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
    appName: 'VeriFi Protocol',
    projectId: 'YOUR_PROJECT_ID',
    chains: [arbitrumSepolia],
    transports: {
        [arbitrumSepolia.id]: http(),
    },
    ssr: true,
})
