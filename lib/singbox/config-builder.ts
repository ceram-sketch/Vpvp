export const buildConfig = (node: any, upstreamProxy?: any) => {
  const outbounds: any[] = [
    {
      type: 'vless',
      tag: 'proxy',
      server: node.address,
      server_port: node.port,
      uuid: node.uuid,
      flow: node.flow || undefined,
      tls: node.security === 'reality' ? {
        enabled: true,
        server_name: node.sni,
        utls: {
          enabled: true,
          fingerprint: node.fp || 'chrome'
        },
        reality: {
          enabled: true,
          public_key: node.pbk,
          short_id: node.sid
        }
      } : undefined
    },
    {
      type: 'direct',
      tag: 'direct'
    }
  ];

  if (upstreamProxy) {
    outbounds.unshift({
      type: 'socks',
      tag: 'upstream',
      server: upstreamProxy.host,
      server_port: upstreamProxy.port
    });
    outbounds[1].detour = 'upstream';
  }

  return {
    log: { level: 'info' },
    inbounds: [
      {
        type: 'mixed',
        tag: 'mixed-in',
        listen: '127.0.0.1',
        listen_port: 2080
      }
    ],
    outbounds,
    route: {
      rules: [
        {
          outbound: 'proxy'
        }
      ]
    }
  };
};
