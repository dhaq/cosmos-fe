import { assets } from 'chain-registry';
import { AssetList, Asset } from '@chain-registry/types';

export const chainName = 'cosmwasmtestnet';
export const stakingDenom = 'uand'; //'umlg';
export const feeDenom = 'umlg';

// export const cw20ContractAddress = 'wasm1p7vmrhl3s0fyl0m9hk2hlm7uuxq84hztur63n8ryh85chh30vt6q89shcv'
export const cw20ContractAddress = 'wasm1jaqw6v3c8tcjv4rwt0euld86wcqjw7nl0shsvwr7sgepwwx96k6qhjdmdn'

export const chainassets: AssetList = assets.find(
    (chain) => chain.chain_name === chainName
) as AssetList;

export const coin: Asset = chainassets.assets.find(
    (asset) => asset.base === stakingDenom
) as Asset;
