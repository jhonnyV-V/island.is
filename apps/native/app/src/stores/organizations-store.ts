import AsyncStorage from '@react-native-community/async-storage'
import createUse from 'zustand'
import { persist } from 'zustand/middleware'
import create, { State } from 'zustand/vanilla'
import organizations from '../graphql/cache/organizations.json'
import islandLogoSrc from '../../assets/logo/logo-64w.png'
import { client } from '../graphql/client'
import { GET_ORGANIZATIONS_QUERY } from '../graphql/queries/get-organizations.query'
import { ImageSourcePropType } from 'react-native'
import { lowerCase } from '../lib/lowercase'

interface Organization {
  id: string
  title: string
  shortTitle: string
  description: string
  slug: string
  tag: Array<{ id: string; title: string }>
  link: string
  logo: null | {
    id: string
    url: string
    title: string
    width: number
    height: number
  }
  query: string
}

interface OrganizationsStore extends State {
  organizations: Organization[]
  getOrganizationLogoUrl(forName: string, size?: number): ImageSourcePropType
  actions: any
}

function processItems(items: Omit<Organization, 'query'>[]) {
  return items.map((item) => ({
    ...(item || {}),
    query: lowerCase(item.title),
  }))
}

const logoCache = new Map()

export const organizationsStore = create<OrganizationsStore>(
  persist(
    (set, get) => ({
      organizations: processItems(organizations),
      getOrganizationLogoUrl(forName: string, size = 100) {
        if (size === 64 && forName === 'Stafrænt Ísland') {
          return islandLogoSrc;
        }

        let c = logoCache.get(forName)
        if (!c) {
          const qs = lowerCase(String(forName).trim())
          const orgs = get().organizations
          const match =
            orgs.find((o) => o.query === qs) ||
            orgs.find((o) => o.logo?.title === 'Skjaldarmerki')
          c = match?.logo?.url
          if (c) {
            logoCache.set(forName, c)
          }
        }
        const url =
          c ??
          '//images.ctfassets.net/8k0h54kbe6bj/6XhCz5Ss17OVLxpXNVDxAO/d3d6716bdb9ecdc5041e6baf68b92ba6/coat_of_arms.svg'
        const uri = `https:${url}?w=${size}&h=${size}&fit=pad&bg=white&fm=png`
        return { uri };
      },
      actions: {
        updateOriganizations() {
          client.query({ query: GET_ORGANIZATIONS_QUERY }).then((res) => {
            set({
              organizations: processItems(res.data.getOrganizations.items),
            })
          })
        },
      },
    }),
    {
      name: 'organizations_01',
      getStorage: () => AsyncStorage,
    },
  ),
)

export const useOrganizationsStore = createUse(organizationsStore)
