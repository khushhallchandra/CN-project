import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def main(filename):
    data = pd.read_csv(filename, header=None)
    means = data.mean(axis = 0)
    stds = data.std(axis = 0)
    return means[0], means[1], stds[0], stds[1]

if __name__ == '__main__':
    files_http1 = ['./results/benchmark_size/http1_txt1.csv', './results/benchmark_size/http1_txt2.csv', './results/benchmark_size/http1_txt3.csv', './results/benchmark_size/http1_txt4.csv', './results/benchmark_size/http1_txt5.csv']
    files_http1_tls = ['./results/benchmark_size/http1_tls_txt1.csv', './results/benchmark_size/http1_tls_txt2.csv', './results/benchmark_size/http1_tls_txt3.csv', './results/benchmark_size/http1_tls_txt4.csv', './results/benchmark_size/http1_tls_txt5.csv']

    files_http2 = ['./results/benchmark_size/http2_txt1.csv', './results/benchmark_size/http2_txt2.csv', './results/benchmark_size/http2_txt3.csv', './results/benchmark_size/http2_txt4.csv', './results/benchmark_size/http2_txt5.csv']
    files_http2_tls = ['./results/benchmark_size/http2_tls_txt1.csv', './results/benchmark_size/http2_tls_txt2.csv', './results/benchmark_size/http2_tls_txt3.csv', './results/benchmark_size/http2_tls_txt4.csv', './results/benchmark_size/http2_tls_txt5.csv']
    
    time_tot_http2, time_contentTransfer_http2 = [], []
    std_tot_http2, std_contentTransfer_http2 = [], []
    
    time_tot_http1, time_contentTransfer_http1 = [], []
    std_tot_http1, std_contentTransfer_http1 = [], []

    time_tot_http2_tls, time_contentTransfer_http2_tls = [], []
    std_tot_http2_tls, std_contentTransfer_http2_tls = [], []
    
    time_tot_http1_tls, time_contentTransfer_http1_tls = [], []
    std_tot_http1_tls, std_contentTransfer_http1_tls = [], []


    for f in files_http2:
        t1, t2, std1, std2 = main(f)
        time_contentTransfer_http2.append(t1)
        time_tot_http2.append(t2)

        std_contentTransfer_http2.append(2*std1)
        std_tot_http2.append(2*std2)

    for f in files_http1:
        t1, t2, std1, std2 = main(f)
        time_contentTransfer_http1.append(t1)
        time_tot_http1.append(t2)

        std_contentTransfer_http1.append(2*std1)
        std_tot_http1.append(2*std2)

    for f in files_http2_tls:
        t1, t2, std1, std2 = main(f)
        time_contentTransfer_http2_tls.append(t1)
        time_tot_http2_tls.append(t2)

        std_contentTransfer_http2_tls.append(2*std1)
        std_tot_http2_tls.append(2*std2)

    for f in files_http1_tls:
        t1, t2, std1, std2 = main(f)
        time_contentTransfer_http1_tls.append(t1)
        time_tot_http1_tls.append(t2)

        std_contentTransfer_http1_tls.append(2*std1)
        std_tot_http1_tls.append(2*std2)


    x = [100, 1000, 10000, 100000, 1000000]
    time_tot_http2, time_contentTransfer_http2 = np.array(time_tot_http2), np.array(time_contentTransfer_http2)
    std_tot_http2, std_contentTransfer_http2 = np.array(std_tot_http2), np.array(std_contentTransfer_http2)
    time_tot_http1, time_contentTransfer_http1 = np.array(time_tot_http1), np.array(time_contentTransfer_http1)
    std_tot_http1, std_contentTransfer_http1 = np.array(std_tot_http1), np.array(std_contentTransfer_http1)

    time_tot_http2_tls, time_contentTransfer_http2_tls = np.array(time_tot_http2_tls), np.array(time_contentTransfer_http2_tls)
    std_tot_http2_tls, std_contentTransfer_http2_tls = np.array(std_tot_http2_tls), np.array(std_contentTransfer_http2_tls)
    time_tot_http1_tls, time_contentTransfer_http1_tls = np.array(time_tot_http1_tls), np.array(time_contentTransfer_http1_tls)
    std_tot_http1_tls, std_contentTransfer_http1_tls = np.array(std_tot_http1_tls), np.array(std_contentTransfer_http1_tls)

    fig, ax = plt.subplots()  
    ax.grid()
    ax.plot(x, time_contentTransfer_http1, 'o-', color='r', label="HTTP1")
    ax.plot(x, time_contentTransfer_http1_tls, 'o-', color='g', label="HTTP1_with_tls")
    ax.plot(x, time_contentTransfer_http2, 'o-', color='b', label="SPDY")
    ax.plot(x, time_contentTransfer_http2_tls, 'o-', color='k', label="SPDY_with_tls")

    ax.fill_between(x, time_contentTransfer_http1 - std_contentTransfer_http1, time_contentTransfer_http1 + std_contentTransfer_http1, color='gray', alpha=0.3)
    ax.fill_between(x, time_contentTransfer_http2 - std_contentTransfer_http2, time_contentTransfer_http2 + std_contentTransfer_http2, color='gray', alpha=0.3)
    ax.fill_between(x, time_contentTransfer_http1_tls - std_contentTransfer_http1_tls, time_contentTransfer_http1_tls + std_contentTransfer_http1_tls, color='gray', alpha=0.3)
    ax.fill_between(x, time_contentTransfer_http2_tls - std_contentTransfer_http2_tls, time_contentTransfer_http2_tls + std_contentTransfer_http2_tls, color='gray', alpha=0.3)

    # ax.errorbar(x, time_contentTransfer_http2, yerr=std_contentTransfer_http2, fmt='-', color='r', label="HTTP2")
    # ax.errorbar(x, time_contentTransfer_quic, yerr=std_contentTransfer_quic, fmt='-', color='b', label="QUIC")
    ax.set_xlabel('Size of data (Length)')
    ax.set_ylabel('Time (in ms)')
    ax.legend()
    ax.set_xscale('log')
    ax.set_title('Comparison of Time Taken for Data Transfer with TLS ON/OFF')
    fig.savefig('results/plots/time_contentTransfer_tls.png', dpi=fig.dpi)


    fig, ax = plt.subplots()  
    ax.grid()
    ax.plot(x, time_tot_http1, 'o-', color='r', label="HTTP1")
    ax.plot(x, time_tot_http1_tls, 'o-', color='g', label="HTTP1_with_tls")
    ax.plot(x, time_tot_http2, 'o-', color='b', label="SPDY")
    ax.plot(x, time_tot_http2_tls, 'o-', color='k', label="SPDY_with_tls")


    ax.fill_between(x, time_tot_http1 - std_tot_http1, time_tot_http1 + std_tot_http1, color='gray', alpha=0.3)
    ax.fill_between(x, time_tot_http2 - std_tot_http2, time_tot_http2 + std_tot_http2, color='gray', alpha=0.3)
    ax.fill_between(x, time_tot_http1_tls - std_tot_http1_tls, time_tot_http1_tls + std_tot_http1_tls, color='gray', alpha=0.3)
    ax.fill_between(x, time_tot_http2_tls - std_tot_http2_tls, time_tot_http2_tls + std_tot_http2_tls, color='gray', alpha=0.3)

    # ax.errorbar(x, time_tot_http2, yerr=std_tot_http2, fmt='-', color='r', label="HTTP2")
    # ax.errorbar(x, time_tot_quic, yerr=std_tot_quic, fmt='-', color='b', label="QUIC")
    ax.set_xlabel('Size of data (Length)')
    ax.set_ylabel('Time (in ms)')
    ax.legend()
    ax.set_xscale('log')
    ax.set_title('Comparison of Total Time with TLS ON/OFF')
    fig.savefig('results/plots/total_time_tls.png', dpi=fig.dpi)